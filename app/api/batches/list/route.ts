import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const manufacturerAddress = searchParams.get('manufacturer');

        const batches = await db.listBatches(manufacturerAddress || undefined);

        return NextResponse.json({
            success: true,
            batches,
            count: batches.length,
        });
    } catch (error: any) {
        console.error('Error listing batches:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to list batches' },
            { status: 500 }
        );
    }
}
