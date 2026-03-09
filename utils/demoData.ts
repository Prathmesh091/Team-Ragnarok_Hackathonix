// Demo data generator for Veridion platform
import { db } from '@/lib/database';

export const DEMO_PRODUCTS = [
    {
        company_id: 'c2000000-0000-0000-0000-000000000000',
        product_name: 'Galaxy Pro Max X1',
        product_category: 'Electronics',
        description: 'Flagship smartphone with 6.8" AMOLED display',
        sku: 'SKU-GP-X1-256',
    },
    {
        company_id: 'c2000000-0000-0000-0000-000000000000',
        product_name: 'Organic Darjeeling Tea',
        product_category: 'Food',
        description: 'Premium first flush Darjeeling tea leaves, 500g pack',
        sku: 'SKU-ODT-500',
    }
];

export const DEMO_BATCHES = [
    {
        batch_id: 'VRD-ELEC-001',
        manufacturer_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        quantity: 5000,
        production_date: new Date('2024-11-01').toISOString(),
        expiry_date: new Date('2027-11-01').toISOString(),
        origin_location: 'Shenzhen, China',
        status: 'DELIVERED' as const,
        trust_score: 98,
        sku: 'SKU-GP-X1-256', // Helper field to find product id
    },
    {
        batch_id: 'VRD-FOOD-001',
        manufacturer_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        quantity: 10000,
        production_date: new Date('2024-08-01').toISOString(),
        expiry_date: new Date('2025-08-01').toISOString(),
        origin_location: 'Darjeeling, India',
        status: 'IN_TRANSIT' as const,
        trust_score: 88,
        sku: 'SKU-ODT-500',
    },
    {
        batch_id: 'VRD-FOOD-002-COUNTERFEIT',
        manufacturer_address: '0xFAKE_MANUFACTURER',
        quantity: 5000,
        production_date: new Date('2024-08-01').toISOString(),
        expiry_date: new Date('2025-08-01').toISOString(),
        origin_location: 'Unknown Location',
        status: 'FLAGGED' as const,
        trust_score: 23,
        sku: 'SKU-ODT-500',
    }
];

export const DEMO_EVENTS = [
    // Electronics Flow
    {
        batch_id: 'VRD-ELEC-001',
        event_type: 'CREATED' as const,
        actor_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        actor_name: 'TechNova Solutions',
        stage: 'PRODUCER',
        location: 'Shenzhen, China',
        is_anomaly: false,
        metadata: { qa_passed: true },
    },
    {
        batch_id: 'VRD-ELEC-001',
        event_type: 'TRANSFERRED' as const,
        actor_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        actor_name: 'TechNova Solutions',
        stage: 'LOGISTICS',
        location: 'Shenzhen Port',
        is_anomaly: false,
        metadata: { container: 'C-1002', destination: 'Mumbai' },
    },
    {
        batch_id: 'VRD-ELEC-001',
        event_type: 'RECEIVED' as const,
        actor_address: '0x1111AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
        actor_name: 'SwiftMove Logistics',
        stage: 'LOGISTICS',
        location: 'Mumbai Port',
        is_anomaly: false,
        metadata: { condition: 'Good' },
    },
    {
        batch_id: 'VRD-ELEC-001',
        event_type: 'TRANSFERRED' as const,
        actor_address: '0x1111AAAA2222BBBB3333CCCC4444DDDD5555EEEE',
        actor_name: 'SwiftMove Logistics',
        stage: 'VENDOR',
        location: 'Mumbai Port',
        is_anomaly: false,
        metadata: { carrier: 'Local Trucking' },
    },
    {
        batch_id: 'VRD-ELEC-001',
        event_type: 'RECEIVED' as const,
        actor_address: '0x6666FFFF7777AAAA8888BBBB9999CCCC0000DDDD',
        actor_name: 'GreenMart Retail',
        stage: 'VENDOR',
        location: 'Mumbai Store',
        is_anomaly: false,
        metadata: { condition: 'Good' },
    },
    // Food Flow
    {
        batch_id: 'VRD-FOOD-001',
        event_type: 'CREATED' as const,
        actor_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        actor_name: 'TechNova Agrotech',
        stage: 'PRODUCER',
        location: 'Darjeeling, India',
        is_anomaly: false,
        metadata: { organic_certified: true },
    },
    {
        batch_id: 'VRD-FOOD-001',
        event_type: 'TRANSFERRED' as const,
        actor_address: '0xA1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0',
        actor_name: 'TechNova Agrotech',
        stage: 'LOGISTICS',
        location: 'Darjeeling, India',
        is_anomaly: false,
        metadata: { temperature_controlled: true },
    },
    // Counterfeit Anomaly
    {
        batch_id: 'VRD-FOOD-002-COUNTERFEIT',
        event_type: 'SCANNED' as const,
        actor_address: '0xSCANNER01',
        actor_name: 'Unknown',
        stage: 'CONSUMER',
        location: 'Remote Location',
        is_anomaly: true,
        metadata: { ip: '192.168.1.1' },
    }
];

export async function seedDemoData() {
    try {
        console.log('🌱 Seeding universal demo data...');

        // 1. Create Products
        const productMap = new Map<string, string>(); // sku -> id
        const existingProducts = await db.listProducts();

        for (const prod of DEMO_PRODUCTS) {
            const existing = existingProducts.find(p => p.sku === prod.sku);
            if (!existing) {
                const created = await db.createProduct(prod);
                productMap.set(prod.sku, created.id);
                console.log(`✅ Created product: ${prod.product_name}`);
            } else {
                productMap.set(prod.sku, existing.id);
                console.log(`ℹ️  Product exists: ${prod.product_name}`);
            }
        }

        // 2. Create Batches
        for (const batch of DEMO_BATCHES) {
            try {
                const existing = await db.getBatch(batch.batch_id).catch(() => null);
                if (!existing) {
                    const productId = productMap.get(batch.sku);
                    if (!productId) {
                        console.warn(`⚠️  Cannot create batch without product ID for SKU: ${batch.sku}`);
                        continue;
                    }

                    // Remove sku before passing to db create
                    const { sku, ...batchData } = batch;

                    await db.createBatch({
                        ...batchData,
                        product_id: productId
                    });
                    console.log(`✅ Created batch: ${batch.batch_id}`);
                } else {
                    console.log(`ℹ️  Batch exists: ${batch.batch_id}`);
                }
            } catch (err: any) {
                if (err.code !== '23505') throw err;
            }
        }

        // 3. Create Tracking Events
        for (const event of DEMO_EVENTS) {
            try {
                // Since events don't have natural composite unique keys without complex setup, 
                // we'll just insert and rely on manual cleanup if dupes are an issue in dev.
                await db.recordEvent(event);
                console.log(`✅ Logged event [${event.event_type}] for: ${event.batch_id}`);
            } catch (err: any) {
                console.warn(`⚠️  Error logging event:`, err.message);
            }
        }

        console.log('🎉 Universal Demo data seeded successfully!');
        return { success: true };
    } catch (error: any) {
        console.error('❌ Error seeding demo data:', error);
        return { success: false, error: error.message };
    }
}

export function isDemoMode() {
    return typeof window !== 'undefined' && localStorage.getItem('veridion_demo_mode') === 'true';
}

export function enableDemoMode() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('veridion_demo_mode', 'true');
    }
}

export function disableDemoMode() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('veridion_demo_mode');
    }
}
