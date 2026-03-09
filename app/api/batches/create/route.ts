import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            batch_id,
            manufacturer_address,
            medicine_name,
            dosage,
            quantity,
            manufacturing_date,
            expiry_date,
            metadata_hash,
        } = body;

        // Validate required fields
        if (!batch_id || !manufacturer_address || !medicine_name || !dosage || !quantity || !manufacturing_date || !expiry_date) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create batch in database
        const batch = await db.createBatch({
            batch_id,
            manufacturer_address,
            medicine_name,
            dosage,
            quantity: parseInt(quantity),
            manufacturing_date,
            expiry_date,
            status: 'CREATED',
            trust_score: 100,
            metadata_hash,
        });

        // Log analytics event (non-blocking - don't fail if this errors)
        try {
            await db.logEvent({
                event_type: 'BATCH_CREATED',
                batch_id,
                manufacturer_address,
                details: {
                    medicine_name,
                    quantity,
                },
                severity: 'INFO',
            });
        } catch (analyticsError: any) {
            // Log error but don't fail the request
            console.warn('Failed to log analytics event:', analyticsError.message);
        }

        return NextResponse.json(
            {
                success: true,
                batch,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating batch:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create batch' },
            { status: 500 }
        );
    }
}
