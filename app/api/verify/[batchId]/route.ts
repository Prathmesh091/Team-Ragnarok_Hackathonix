import { NextRequest, NextResponse } from 'next/server';
import { DEMO_BATCHES, DEMO_PRODUCTS, DEMO_TRANSFERS, DEMO_SHIPMENTS } from '@/utils/demo';

// Build lookups
const PRODUCT_MAP: Record<string, typeof DEMO_PRODUCTS[0]> = {};
DEMO_PRODUCTS.forEach(p => { PRODUCT_MAP[p.id] = p; });

// Map shipment IDs to batch IDs
const SHIPMENT_TO_BATCH: Record<string, string> = {};
DEMO_SHIPMENTS.forEach(s => { SHIPMENT_TO_BATCH[s.shipment_id] = s.batch_id; });

// Map product names to first matching batch ID (lowercase)
const PRODUCT_NAME_TO_BATCH: Record<string, string> = {};
DEMO_BATCHES.forEach(b => {
    const product = PRODUCT_MAP[b.product_id];
    if (product && !PRODUCT_NAME_TO_BATCH[product.product_name.toLowerCase()]) {
        PRODUCT_NAME_TO_BATCH[product.product_name.toLowerCase()] = b.batch_id;
    }
});

interface TrustScoreInputs {
    supplyChainComplete: boolean;
    anomalyCount: number;
    expiryValid: boolean;
    transferCount: number;
}

function calculateTrustScore(inputs: TrustScoreInputs): number {
    let score = 10;
    if (inputs.supplyChainComplete) score += 40;
    score -= Math.min(inputs.anomalyCount * 10, 30);
    if (inputs.expiryValid) score += 20;
    if (inputs.transferCount >= 2 && inputs.transferCount <= 6) score += 20;
    else if (inputs.transferCount > 0) score += 10;
    if (inputs.transferCount >= 1) score += 10;
    return Math.max(0, Math.min(100, score));
}

function resolveBatchId(searchId: string): string | null {
    // 1. Direct batch ID match
    if (DEMO_BATCHES.find(b => b.batch_id === searchId)) return searchId;

    // 2. Shipment ID → batch ID
    if (SHIPMENT_TO_BATCH[searchId]) return SHIPMENT_TO_BATCH[searchId];

    // 3. Product name match (case-insensitive)
    const nameLower = searchId.toLowerCase();
    if (PRODUCT_NAME_TO_BATCH[nameLower]) return PRODUCT_NAME_TO_BATCH[nameLower];

    // 4. Partial name match
    const partialMatch = Object.keys(PRODUCT_NAME_TO_BATCH).find(name => name.includes(nameLower));
    if (partialMatch) return PRODUCT_NAME_TO_BATCH[partialMatch];

    // 5. Shipment partial match (e.g. "SHP-003" → try "SHP-003")
    const shipmentMatch = Object.keys(SHIPMENT_TO_BATCH).find(id =>
        id.toLowerCase() === searchId.toLowerCase()
    );
    if (shipmentMatch) return SHIPMENT_TO_BATCH[shipmentMatch];

    return null;
}

function getDemoBatchData(batchId: string) {
    const batch = DEMO_BATCHES.find(b => b.batch_id === batchId);
    if (!batch) return null;

    const product = PRODUCT_MAP[batch.product_id];
    const transfers = DEMO_TRANSFERS.filter(t => t.batch_id === batchId);

    const batchData = {
        batch_id: batch.batch_id,
        product_id: batch.product_id,
        product_name: product?.product_name || batch.product_id,
        product_category: product?.category || 'Unknown',
        sku: product?.sku || '—',
        description: product?.description || '',
        manufacturer_address: product?.manufacturer || 'Unknown',
        manufacturer_name: product?.manufacturer || 'Unknown',
        quantity: 1,
        production_date: batch.production_date,
        expiry_date: batch.expiry_date,
        origin_location: batch.origin_location,
        status: batch.status === 'Delivered' ? 'DELIVERED' : batch.status === 'In Transit' ? 'IN_TRANSIT' : batch.status === 'Flagged' ? 'FLAGGED' : 'CREATED',
        trust_score: 0,
        created_at: batch.production_date + 'T00:00:00Z',
        updated_at: new Date().toISOString(),
    };

    const transferEvents = transfers.map((t, i) => ({
        id: t.transfer_id,
        batch_id: t.batch_id,
        event_type: 'TRANSFERRED',
        to_role: t.to_company,
        to_address: t.blockchain_tx_hash?.slice(0, 42) || `0x${i.toString().padStart(40, '0')}`,
        from_role: t.from_company,
        stage: t.to_company,
        location: t.location,
        timestamp: t.timestamp,
        blockchain_tx_hash: t.blockchain_tx_hash,
        is_anomaly: t.status === 'Flagged',
    }));

    const allCompanies = transfers.flatMap(t => [t.from_company.toLowerCase(), t.to_company.toLowerCase()]);
    const hasLogistics = allCompanies.some(r => r.includes('logistic') || r.includes('distributor') || r.includes('swift') || r.includes('rapid') || r.includes('freight'));
    const hasVendor = allCompanies.some(r => r.includes('vendor') || r.includes('retail') || r.includes('pharmacy') || r.includes('boutique') || r.includes('greenmart') || r.includes('luxe'));
    const supplyChainComplete = hasLogistics && hasVendor;

    let expiryValid = true;
    if (batchData.expiry_date) expiryValid = new Date(batchData.expiry_date) > new Date();

    const anomalies = transferEvents.filter(e => e.is_anomaly).length;
    const trustScore = calculateTrustScore({ supplyChainComplete, anomalyCount: anomalies, expiryValid, transferCount: transferEvents.length });
    batchData.trust_score = trustScore;

    let status: 'genuine' | 'suspicious' | 'counterfeit' = 'genuine';
    const warnings: string[] = [];

    if (batch.status === 'Flagged') { status = 'counterfeit'; warnings.push('Batch flagged — suspicious origin'); }
    if (!expiryValid) { status = 'counterfeit'; warnings.push('Batch has expired'); }
    if (!supplyChainComplete && transferEvents.length > 0 && batch.status !== 'Flagged') { status = 'suspicious'; warnings.push('Incomplete supply chain'); }
    if (trustScore < 50) status = 'counterfeit';
    else if (trustScore < 70 && status === 'genuine') status = 'suspicious';

    let missingLink = null;
    if (transferEvents.length > 0 && !hasLogistics) missingLink = 'logistics';

    return {
        success: true,
        batch: batchData,
        transfers: transferEvents,
        events: transferEvents,
        scans: [],
        verification: { status, trustScore, warnings, missingLink, isExpired: !expiryValid, supplyChainComplete, scanCount: 0, anomalies, duplicateScans: 0 },
    };
}

export async function POST(
    request: NextRequest,
    { params }: { params: { batchId: string } }
) {
    try {
        const searchId = params.batchId;

        // Try database first
        try {
            const { db } = await import('@/lib/database');
            const batch = await db.getBatch(searchId);
            if (batch) {
                const events = await db.getTrackingHistory(searchId);
                const scans = events.filter(e => e.event_type === 'SCANNED');
                const transfers = events.filter(e => e.event_type !== 'SCANNED');
                const stages = events.map(t => t.stage.toLowerCase());
                const hasLogistics = stages.some(s => s.includes('logistic') || s.includes('distributor'));
                const hasVendor = stages.some(s => s.includes('vendor') || s.includes('retailer'));
                const supplyChainComplete = hasLogistics && hasVendor;
                const anomalies = events.filter(e => e.is_anomaly).length;
                let expiryValid = true;
                if (batch.expiry_date) expiryValid = new Date(batch.expiry_date) > new Date();
                const trustScore = calculateTrustScore({ supplyChainComplete, anomalyCount: anomalies, expiryValid, transferCount: transfers.length });
                await db.updateTrustScore(searchId, trustScore);

                let status: 'genuine' | 'suspicious' | 'counterfeit' = 'genuine';
                const warnings: string[] = [];
                if (anomalies > 0) { status = 'suspicious'; warnings.push(`${anomalies} anomalies detected`); }
                if (!expiryValid) { status = 'counterfeit'; warnings.push('Batch has expired'); }
                if (!supplyChainComplete && transfers.length > 0) { status = 'suspicious'; warnings.push('Incomplete supply chain'); }
                if (trustScore < 50) status = 'counterfeit';
                else if (trustScore < 70 && status === 'genuine') status = 'suspicious';

                await db.recordEvent({
                    event_type: 'SCANNED', batch_id: searchId, stage: 'System', is_anomaly: status === 'counterfeit',
                    metadata: { action: 'Verification Performed', trust_score: trustScore, status, warnings },
                });

                return NextResponse.json({
                    success: true, batch, transfers, events, scans,
                    verification: { status, trustScore, warnings, missingLink: null, isExpired: !expiryValid, supplyChainComplete, scanCount: scans.length, anomalies },
                });
            }
        } catch (dbError) {
            console.log('DB unavailable, using demo data');
        }

        // Resolve search ID to a batch ID (handles SHP-xxx, product names, etc.)
        const resolvedBatchId = resolveBatchId(searchId);

        if (!resolvedBatchId) {
            // Build helpful error message
            const availableProducts = DEMO_PRODUCTS.map(p => p.product_name).join(', ');
            return NextResponse.json({
                error: `Product or batch "${searchId}" not found. Try searching by:\n• Product name: Galaxy Pro Max X1, Amoxicillin 500mg, etc.\n• Batch ID: BAT-ELEC-001, BAT-PHAR-001, BAT-FOOD-001\n• Shipment ID: SHP-001, SHP-002, SHP-003`
            }, { status: 404 });
        }

        const demoResult = getDemoBatchData(resolvedBatchId);
        if (!demoResult) {
            return NextResponse.json({ error: `Could not load data for batch ${resolvedBatchId}` }, { status: 404 });
        }

        return NextResponse.json(demoResult);

    } catch (error: any) {
        console.error('Error verifying batch:', error);
        return NextResponse.json({ error: error.message || 'Failed to verify batch' }, { status: 500 });
    }
}
