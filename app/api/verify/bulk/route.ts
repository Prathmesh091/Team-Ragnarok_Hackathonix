import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import papaparse from 'papaparse';

interface CSVRow {
    batchId: string;
    [key: string]: any;
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

        const batchIds = parsed.data.map(row => row.batchId || row.batch_id || row.BatchID).filter(Boolean);

        if (batchIds.length === 0) {
            return NextResponse.json(
                { error: 'No batch IDs found in CSV. Expected column: batchId, batch_id, or BatchID' },
                { status: 400 }
            );
        }

        // Verify each batch
        const results = await Promise.all(
            batchIds.map(async (batchId) => {
                try {
                    // Get batch details
                    const batch = await db.getBatch(batchId);

                    if (!batch) {
                        return {
                            batchId,
                            status: 'not_found',
                            trustScore: 0,
                            warnings: ['Batch not found in system'],
                        };
                    }

                    // Get transfer history
                    const transfers = await db.getTransferHistory(batchId);

                    // Get scan history
                    const scans = await db.getScanHistory(batchId);

                    // Check expiry
                    const isExpired = new Date(batch.expiry_date) < new Date();

                    // Check supply chain
                    const roles = transfers.map(t => t.to_role.toLowerCase());
                    const hasDistributor = roles.some(r => r.includes('distributor'));
                    const hasPharmacy = roles.some(r => r.includes('pharmacy'));
                    const supplyChainComplete = hasDistributor && hasPharmacy;

                    // Determine status
                    let status: 'genuine' | 'suspicious' | 'expired' | 'counterfeit' = 'genuine';
                    const warnings: string[] = [];

                    if (isExpired) {
                        status = 'expired';
                        warnings.push('Batch has expired');
                    } else if (batch.trust_score < 50) {
                        status = 'counterfeit';
                        warnings.push('Low trust score');
                    } else if (batch.trust_score < 70 || !supplyChainComplete) {
                        status = 'suspicious';
                        if (!supplyChainComplete) {
                            warnings.push('Incomplete supply chain');
                        }
                    }

                    const invalidScans = scans.filter(s => !s.is_valid).length;
                    if (invalidScans > 0) {
                        warnings.push(`${invalidScans} duplicate scan(s)`);
                    }

                    return {
                        batchId,
                        status,
                        trustScore: batch.trust_score,
                        warnings,
                        medicineName: batch.medicine_name,
                        expiryDate: batch.expiry_date,
                        manufacturer: batch.manufacturer_address,
                    };
                } catch (error: any) {
                    return {
                        batchId,
                        status: 'error',
                        trustScore: 0,
                        warnings: [error.message || 'Verification failed'],
                    };
                }
            })
        );

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

        const genuinePercentage = Math.round((stats.genuine / stats.total) * 100);
        const suspiciousPercentage = Math.round((stats.suspicious / stats.total) * 100);
        const expiredPercentage = Math.round((stats.expired / stats.total) * 100);

        // Log analytics event
        await db.logEvent({
            event_type: 'BULK_VERIFICATION',
            details: {
                total_batches: stats.total,
                stats,
            },
            severity: stats.counterfeit > 0 ? 'WARNING' : 'INFO',
        });

        return NextResponse.json({
            success: true,
            results,
            stats,
            percentages: {
                genuine: genuinePercentage,
                suspicious: suspiciousPercentage,
                expired: expiredPercentage,
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
