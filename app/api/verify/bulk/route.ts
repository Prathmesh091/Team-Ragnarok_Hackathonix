import { NextRequest, NextResponse } from 'next/server';
import { DEMO_BATCHES, DEMO_PRODUCTS, DEMO_TRANSFERS } from '@/utils/demo';
import papaparse from 'papaparse';

interface CSVRow {
    batchId: string;
    [key: string]: any;
}

// Build product lookup
const PRODUCT_MAP: Record<string, typeof DEMO_PRODUCTS[0]> = {};
DEMO_PRODUCTS.forEach(p => { PRODUCT_MAP[p.id] = p; });

function verifyBatchFromDemo(batchId: string) {
    const batch = DEMO_BATCHES.find(b => b.batch_id === batchId);

    if (!batch) {
        return {
            batchId,
            status: 'not_found' as const,
            trustScore: 0,
            reason: 'Batch not found in system',
            productName: '—',
            expiryDate: null,
            manufacturer: '—',
        };
    }

    const product = PRODUCT_MAP[batch.product_id];
    const transfers = DEMO_TRANSFERS.filter(t => t.batch_id === batchId);

    // Check expiry
    const isExpired = batch.expiry_date ? new Date(batch.expiry_date) < new Date() : false;

    // Check supply chain completeness
    const allCompanies = transfers.flatMap(t => [t.from_company.toLowerCase(), t.to_company.toLowerCase()]);
    const hasLogistics = allCompanies.some(r => r.includes('logistic') || r.includes('distributor') || r.includes('swift') || r.includes('rapid') || r.includes('freight'));
    const hasVendor = allCompanies.some(r => r.includes('vendor') || r.includes('retail') || r.includes('pharmacy') || r.includes('boutique') || r.includes('greenmart') || r.includes('luxe'));
    const supplyChainComplete = hasLogistics && hasVendor;

    // Calculate trust score
    let trustScore = 10; // baseline
    if (supplyChainComplete) trustScore += 40;
    if (!isExpired) trustScore += 20;
    if (transfers.length >= 2 && transfers.length <= 6) trustScore += 20;
    else if (transfers.length > 0) trustScore += 10;
    if (transfers.length >= 1) trustScore += 10;
    if (batch.status === 'Flagged') trustScore -= 30;

    trustScore = Math.max(0, Math.min(100, trustScore));

    // Determine status
    let status: 'genuine' | 'suspicious' | 'expired' | 'counterfeit' = 'genuine';
    const reasons: string[] = [];

    if (batch.status === 'Flagged') {
        status = 'counterfeit';
        reasons.push('Batch flagged — suspicious origin');
    } else if (isExpired) {
        status = 'expired';
        reasons.push('Batch has expired');
    } else if (trustScore < 50) {
        status = 'counterfeit';
        reasons.push('Low trust score');
    } else if (trustScore < 70 || !supplyChainComplete) {
        status = 'suspicious';
        if (!supplyChainComplete) reasons.push('Incomplete supply chain');
        else reasons.push('Moderate trust score');
    } else {
        reasons.push(`Trust score: ${trustScore}/100. Supply chain verified.`);
    }

    return {
        batchId,
        status,
        trustScore,
        reason: reasons.join('. '),
        productName: product?.product_name || batch.product_id,
        expiryDate: batch.expiry_date,
        manufacturer: product?.manufacturer || 'Unknown',
    };
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file content
        const text = await file.text();

        // Parse CSV
        const parsed = papaparse.parse<CSVRow>(text, {
            header: true,
            skipEmptyLines: true,
        });

        if (parsed.errors.length > 0) {
            return NextResponse.json(
                { error: 'Invalid CSV format', details: parsed.errors },
                { status: 400 }
            );
        }

        const batchIds = parsed.data.map(row => row.batchId || row.batch_id || row.BatchID || row.batchid || row.BATCH_ID).filter(Boolean);

        if (batchIds.length === 0) {
            return NextResponse.json(
                { error: 'No batch IDs found in CSV. Expected column: batchId, batch_id, or BatchID' },
                { status: 400 }
            );
        }

        // First try database, falling back to demo data
        let results: any[] = [];
        let useDemo = false;

        try {
            const { db } = await import('@/lib/database');
            // Test if DB is available by attempting one query
            const testBatch = await db.getBatch(batchIds[0]);
            // If no error is thrown, DB is available
            results = await Promise.all(
                batchIds.map(async (batchId) => {
                    try {
                        const batch = await db.getBatch(batchId);
                        if (!batch) {
                            return { batchId, status: 'not_found', trustScore: 0, reason: 'Batch not found in system' };
                        }
                        const transfers = await db.getTransferHistory(batchId);
                        const scans = await db.getScanHistory(batchId);
                        const isExpired = batch.expiry_date ? new Date(batch.expiry_date) < new Date() : false;
                        const roles = transfers.map((t: any) => (t.to_role || t.stage || '').toLowerCase());
                        const hasDistributor = roles.some((r: string) => r.includes('distributor') || r.includes('logistic'));
                        const hasVendor = roles.some((r: string) => r.includes('vendor') || r.includes('retail'));
                        const supplyChainComplete = hasDistributor && hasVendor;

                        let status: string = 'genuine';
                        const reason: string[] = [];
                        if (isExpired) { status = 'expired'; reason.push('Batch has expired'); }
                        else if (batch.trust_score < 50) { status = 'counterfeit'; reason.push('Low trust score'); }
                        else if (batch.trust_score < 70 || !supplyChainComplete) { status = 'suspicious'; if (!supplyChainComplete) reason.push('Incomplete supply chain'); }
                        else { reason.push(`Trust score: ${batch.trust_score}/100`); }

                        return { batchId, status, trustScore: batch.trust_score, reason: reason.join('. '), productName: batch.product_name, expiryDate: batch.expiry_date, manufacturer: batch.manufacturer_address };
                    } catch (err: any) {
                        return { batchId, status: 'error', trustScore: 0, reason: err.message || 'Verification failed' };
                    }
                })
            );
        } catch (dbError) {
            console.log('DB unavailable, using demo data for bulk verification');
            useDemo = true;
        }

        if (useDemo) {
            results = batchIds.map(batchId => verifyBatchFromDemo(batchId));
        }

        // Calculate statistics
        const stats = {
            total: results.length,
            genuine: results.filter(r => r.status === 'genuine').length,
            suspicious: results.filter(r => r.status === 'suspicious').length,
            expired: results.filter(r => r.status === 'expired').length,
            counterfeit: results.filter(r => r.status === 'counterfeit').length,
            notFound: results.filter(r => r.status === 'not_found').length,
            error: results.filter(r => r.status === 'error').length,
        };

        return NextResponse.json({
            success: true,
            results,
            stats,
            percentages: {
                genuine: stats.total > 0 ? Math.round((stats.genuine / stats.total) * 100) : 0,
                suspicious: stats.total > 0 ? Math.round((stats.suspicious / stats.total) * 100) : 0,
                expired: stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0,
            },
        });
    } catch (error: any) {
        console.error('Error in bulk verification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process bulk verification' },
            { status: 500 }
        );
    }
}
