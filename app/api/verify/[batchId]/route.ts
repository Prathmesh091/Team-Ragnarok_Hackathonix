import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Trust score calculation algorithm
interface TrustScoreInputs {
    supplyChainComplete: boolean;
    qrReuseCount: number;
    expiryValid: boolean;
    transferTimings: number[];
    scanCount: number;
}

function calculateTrustScore(inputs: TrustScoreInputs): number {
    let score = 0;

    // Supply chain completeness (40 points)
    if (inputs.supplyChainComplete) {
        score += 40;
    }

    // QR reuse penalty (-10 per reuse, max -30)
    score -= Math.min(inputs.qrReuseCount * 10, 30);

    // Expiry validity (20 points)
    if (inputs.expiryValid) {
        score += 20;
    }

    // Transfer timing consistency (20 points)
    if (inputs.transferTimings.length > 0) {
        const avgTime = inputs.transferTimings.reduce((a, b) => a + b, 0) / inputs.transferTimings.length;
        // Reasonable transfer time (1-30 days)
        if (avgTime >= 86400000 && avgTime <= 2592000000) {
            score += 20;
        } else if (avgTime < 86400000) {
            // Too fast - suspicious
            score += 10;
        }
    }

    // Scan count (10 points for reasonable scans, penalty for too many)
    if (inputs.scanCount >= 1 && inputs.scanCount <= 5) {
        score += 10;
    } else if (inputs.scanCount > 10) {
        score -= 10;
    }

    // Baseline (10 points)
    score += 10;

    return Math.max(0, Math.min(100, score));
}

export async function POST(
    request: NextRequest,
    { params }: { params: { batchId: string } }
) {
    try {
        const batchId = params.batchId;

        // Get batch details
        const batch = await db.getBatch(batchId);
        if (!batch) {
            return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }

        // Get transfer history
        const transfers = await db.getTransferHistory(batchId);

        // Get scan history
        const scans = await db.getScanHistory(batchId);

        // Check supply chain completeness
        const roles = transfers.map(t => t.to_role);
        const hasDistributor = roles.includes('distributor') || roles.includes('Distributor');
        const hasPharmacy = roles.includes('pharmacy') || roles.includes('Pharmacy');
        const supplyChainComplete = hasDistributor && hasPharmacy;

        // Calculate QR reuse
        const invalidScans = scans.filter(s => !s.is_valid).length;

        // Check expiry
        const expiryValid = new Date(batch.expiry_date) > new Date();

        // Calculate transfer timings
        const transferTimings: number[] = [];
        for (let i = 1; i < transfers.length; i++) {
            const timeDiff = new Date(transfers[i].timestamp).getTime() - new Date(transfers[i - 1].timestamp).getTime();
            transferTimings.push(timeDiff);
        }

        // Calculate trust score
        const trustScore = calculateTrustScore({
            supplyChainComplete,
            qrReuseCount: invalidScans,
            expiryValid,
            transferTimings,
            scanCount: scans.length,
        });

        // Update trust score in database
        await db.updateTrustScore(batchId, trustScore);

        // Detect missing links
        let missingLink = null;
        if (transfers.length > 0) {
            const expectedOrder = ['manufacturer', 'distributor', 'pharmacy'];
            const actualRoles = [batch.manufacturer_address ? 'manufacturer' : null, ...roles].filter(Boolean);

            for (let i = 0; i < expectedOrder.length - 1; i++) {
                const currentRole = expectedOrder[i].toLowerCase();
                const nextRole = expectedOrder[i + 1].toLowerCase();

                const hasCurrentRole = actualRoles.some(r => r?.toLowerCase().includes(currentRole));
                const hasNextRole = actualRoles.some(r => r?.toLowerCase().includes(nextRole));

                if (hasNextRole && !hasCurrentRole) {
                    missingLink = expectedOrder[i];
                    break;
                }
            }
        }

        // Check for expired batch
        const isExpired = !expiryValid;

        // Determine status
        let status: 'genuine' | 'suspicious' | 'counterfeit' = 'genuine';
        let warnings: string[] = [];

        if (missingLink) {
            status = 'suspicious';
            warnings.push(`Missing ${missingLink} in supply chain`);
        }

        if (invalidScans > 0) {
            status = 'suspicious';
            warnings.push(`${invalidScans} duplicate scan(s) detected`);
        }

        if (isExpired) {
            status = 'counterfeit';
            warnings.push('Batch has expired');
        }

        if (!supplyChainComplete && transfers.length > 0) {
            status = 'suspicious';
            warnings.push('Incomplete supply chain');
        }

        if (trustScore < 50) {
            status = 'counterfeit';
        } else if (trustScore < 70) {
            status = 'suspicious';
        }

        // Log verification event
        await db.logEvent({
            event_type: 'VERIFICATION_PERFORMED',
            batch_id: batchId,
            details: {
                trust_score: trustScore,
                status,
                warnings,
            },
            severity: status === 'counterfeit' ? 'ERROR' : status === 'suspicious' ? 'WARNING' : 'INFO',
        });

        return NextResponse.json({
            success: true,
            batch,
            transfers,
            scans,
            verification: {
                status,
                trustScore,
                warnings,
                missingLink,
                isExpired,
                supplyChainComplete,
                scanCount: scans.length,
                duplicateScans: invalidScans,
            },
        });
    } catch (error: any) {
        console.error('Error verifying batch:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to verify batch' },
            { status: 500 }
        );
    }
}
