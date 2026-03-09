import { NextRequest, NextResponse } from 'next/server';
import { DEMO_BATCHES, DEMO_PRODUCTS } from '@/utils/demo';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Build product lookup for demo data
const PRODUCT_MAP: Record<string, typeof DEMO_PRODUCTS[0]> = {};
DEMO_PRODUCTS.forEach(p => { PRODUCT_MAP[p.id] = p; });

const demoBatches = DEMO_BATCHES.map(b => {
    const product = PRODUCT_MAP[b.product_id];
    return {
        id: b.batch_id,
        batch_id: b.batch_id,
        product_name: product?.product_name || b.product_id,
        product_category: product?.category || '—',
        sku: product?.sku || '—',
        manufacturer_address: product?.manufacturer || 'Unknown',
        quantity: 1,
        production_date: b.production_date,
        expiry_date: b.expiry_date,
        origin_location: b.origin_location,
        status: b.status === 'Delivered' ? 'DELIVERED' : b.status === 'In Transit' ? 'IN_TRANSIT' : b.status === 'Processing' ? 'CREATED' : b.status === 'Flagged' ? 'FLAGGED' : 'IN_TRANSIT',
        trust_score: 85,
        created_at: b.production_date + 'T00:00:00Z',
        updated_at: new Date().toISOString(),
    };
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const manufacturerAddress = searchParams.get('manufacturer');

        // Try database first
        try {
            const { db } = await import('@/lib/database');
            const batches = await db.listBatches(manufacturerAddress || undefined);

            if (batches.length > 0) {
                return NextResponse.json({
                    success: true,
                    batches,
                    count: batches.length,
                });
            }
        } catch (dbError) {
            console.log('DB unavailable, using demo data for batch listing');
        }

        // Fallback to demo data
        let filtered = demoBatches;
        if (manufacturerAddress) {
            filtered = demoBatches.filter(b => b.manufacturer_address.toLowerCase().includes(manufacturerAddress.toLowerCase()));
        }

        return NextResponse.json({
            success: true,
            batches: filtered,
            count: filtered.length,
        });
    } catch (error: any) {
        console.error('Error listing batches:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to list batches' },
            { status: 500 }
        );
    }
}
