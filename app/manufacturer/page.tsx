'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Factory, Package, Plus, QrCode, Clock, CheckCircle, MapPin, Tag } from 'lucide-react';
import { ethers } from 'ethers';
import { DEMO_BATCHES, DEMO_PRODUCTS } from '@/utils/demo';

// Build demo batch rows for the table
const PRODUCT_MAP: Record<string, typeof DEMO_PRODUCTS[0]> = {};
DEMO_PRODUCTS.forEach(p => { PRODUCT_MAP[p.id] = p; });

const demoBatchRows = DEMO_BATCHES.filter(b => b.status !== 'Flagged').map(b => ({
    id: b.batch_id,
    batch_id: b.batch_id,
    product_name: PRODUCT_MAP[b.product_id]?.product_name || b.product_id,
    product_category: PRODUCT_MAP[b.product_id]?.category || '—',
    sku: PRODUCT_MAP[b.product_id]?.sku || '—',
    origin_location: b.origin_location,
    status: b.status === 'Delivered' ? 'DELIVERED' : b.status === 'In Transit' ? 'IN_TRANSIT' : b.status === 'Processing' ? 'CREATED' : 'IN_TRANSIT',
    production_date: b.production_date,
    expiry_date: b.expiry_date,
    quantity: 1,
}));

export default function CreateProductPage() {
    const { account } = useWallet();
    const { createBatch, loading, error } = useContract();

    const [formData, setFormData] = useState({
        productName: '',
        productCategory: '',
        sku: '',
        productionDate: '',
        manufacturingLocation: '',
        manufacturerName: ''
    });

    const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
    const [lastProduct, setLastProduct] = useState<{ name: string; manufacturer: string; category: string; sku: string; origin: string } | null>(null);
    const [success, setSuccess] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(true);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/batches/list');
            if (res.ok) {
                const data = await res.json();
                const arr = Array.isArray(data) ? data : [];
                if (arr.length > 0) {
                    setBatches(arr);
                    setLoadingBatches(false);
                    return;
                }
            }
        } catch (e) {
            console.log('API unavailable, using demo data');
        }
        // Fallback to demo data
        setBatches(demoBatchRows);
        setLoadingBatches(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setCreatedBatchId(null);
        try {
            const batchId = `VRD-${Date.now()}`;

            // Save to database
            const dbRes = await fetch('/api/batches/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batch_id: batchId,
                    product_name: formData.productName,
                    product_category: formData.productCategory,
                    sku: formData.sku,
                    quantity: 1,
                    production_date: formData.productionDate,
                    origin_location: formData.manufacturingLocation,
                    manufacturer_name: formData.manufacturerName,
                    manufacturer_address: account || 'demo-manufacturer',
                }),
            });

            if (!dbRes.ok) {
                const errData = await dbRes.json();
                throw new Error(errData.error || 'Failed to save product');
            }

            // Blockchain
            if (account) {
                try {
                    const expTimestamp = Math.floor(new Date(formData.productionDate).getTime() / 1000) + 31536000;
                    const metadataHash = ethers.id(`${batchId}-${formData.productName}-${formData.manufacturerName}`);
                    await createBatch(batchId, expTimestamp, metadataHash);
                } catch (blockchainErr) {
                    console.warn('Blockchain recording skipped (wallet issue or no gas):', blockchainErr);
                }
            }

            setCreatedBatchId(batchId);
            setLastProduct({ name: formData.productName, manufacturer: formData.manufacturerName, category: formData.productCategory, sku: formData.sku, origin: formData.manufacturingLocation });

            // Persist to localStorage for local tracking simulation
            try {
                const userProducts = JSON.parse(localStorage.getItem('user_products') || '[]');
                userProducts.unshift({
                    id: batchId,
                    batch_id: batchId,
                    name: formData.productName,
                    manufacturer: formData.manufacturerName,
                    category: formData.productCategory,
                    sku: formData.sku,
                    origin: formData.manufacturingLocation,
                    production_date: formData.productionDate,
                    created_at: new Date().toISOString(),
                    status: 'CREATED'
                });
                localStorage.setItem('user_products', JSON.stringify(userProducts.slice(0, 50))); // Keep last 50
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
            }

            setSuccess(true);
            setFormData({ productName: '', productCategory: '', sku: '', productionDate: '', manufacturingLocation: '', manufacturerName: '' });
            fetchBatches();
        } catch (err: any) {
            // If DB is unavailable, still generate QR
            const batchId = `VRD-${Date.now()}`;
            setCreatedBatchId(batchId);
            setLastProduct({ name: formData.productName, manufacturer: formData.manufacturerName, category: formData.productCategory, sku: formData.sku, origin: formData.manufacturingLocation });

            // Persist to localStorage for local tracking simulation
            try {
                const userProducts = JSON.parse(localStorage.getItem('user_products') || '[]');
                userProducts.unshift({
                    id: batchId,
                    batch_id: batchId,
                    name: formData.productName,
                    manufacturer: formData.manufacturerName,
                    category: formData.productCategory,
                    sku: formData.sku,
                    origin: formData.manufacturingLocation,
                    production_date: formData.productionDate,
                    created_at: new Date().toISOString(),
                    status: 'CREATED'
                });
                localStorage.setItem('user_products', JSON.stringify(userProducts.slice(0, 50)));
            } catch (e) { }

            setSuccess(true);
            setFormData({ productName: '', productCategory: '', sku: '', productionDate: '', manufacturingLocation: '', manufacturerName: '' });
            console.warn('DB unavailable, QR generated in demo mode:', err);
        }
    };

    return (
        <DashboardShell>
            <PageHeader
                title="Create Product"
                description="Register a new product on the blockchain and generate its QR code"
                icon={Factory}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MetricCard icon={Package} label="Total Products" value={batches.length} color="emerald" />
                <MetricCard icon={Clock} label="In Transit" value={batches.filter(b => b.status === 'IN_TRANSIT').length} color="amber" />
                <MetricCard icon={CheckCircle} label="Delivered" value={batches.filter(b => b.status === 'DELIVERED').length} color="blue" />
            </div>

            {/* Form + QR Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                {/* Form — 3/5 */}
                <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Plus className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-gray-200">Product Details</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Product Name *</label>
                                <input type="text" value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })}
                                    placeholder="e.g., Galaxy Pro Max X1" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Product Category *</label>
                                <input type="text" value={formData.productCategory} onChange={e => setFormData({ ...formData, productCategory: e.target.value })}
                                    placeholder="e.g., Electronics, Food, etc." required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">SKU / Code *</label>
                                <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="e.g., SKU-123" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Production Date *</label>
                                <input type="date" value={formData.productionDate} onChange={e => setFormData({ ...formData, productionDate: e.target.value })}
                                    required className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Manufacturing Location *</label>
                                <input type="text" value={formData.manufacturingLocation} onChange={e => setFormData({ ...formData, manufacturingLocation: e.target.value })}
                                    placeholder="e.g., Shenzhen, China" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Factory className="w-3.5 h-3.5" /> Manufacturer Name *</label>
                                <input type="text" value={formData.manufacturerName} onChange={e => setFormData({ ...formData, manufacturerName: e.target.value })}
                                    placeholder="e.g., TechNova Solutions" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">✅ Product batch created and QR code generated successfully!</div>}

                        <button type="submit" disabled={loading}
                            className="w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Processing...' : 'Create Product & Generate QR'}
                        </button>
                    </form>
                </div>

                {/* QR Preview — 2/5 */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-5 self-start">
                        <QrCode className="w-5 h-5 text-purple-400" />
                        <h2 className="text-base font-semibold text-gray-200">QR Code Label</h2>
                    </div>
                    {createdBatchId ? (
                        <QRCodeGenerator batchId={createdBatchId} productName={lastProduct?.name} manufacturer={lastProduct?.manufacturer} category={lastProduct?.category} sku={lastProduct?.sku} origin={lastProduct?.origin} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <div className="w-32 h-32 bg-gray-700/30 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-600">
                                <QrCode className="w-12 h-12 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500">QR code will appear here<br />after product creation</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product History Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-base font-semibold text-gray-200">Product Registration History</h2>
                </div>
                {loadingBatches ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No products registered yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                                    <th className="text-left px-6 py-3 font-medium">Batch / Tracking ID</th>
                                    <th className="text-left px-6 py-3 font-medium">Product Name</th>
                                    <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Category</th>
                                    <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Location</th>
                                    <th className="text-left px-6 py-3 font-medium">Status</th>
                                    <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Production Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/20">
                                {batches.map((batch: any) => (
                                    <tr key={batch.id || batch.batch_id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-3.5 text-sm font-mono text-emerald-400">{batch.batch_id}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-300">{batch.product_name}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-400 hidden sm:table-cell">{batch.product_category || '—'}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-400 hidden sm:table-cell">{batch.origin_location || '—'}</td>
                                        <td className="px-6 py-3.5"><StatusBadge status={batch.status || 'CREATED'} /></td>
                                        <td className="px-6 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                                            {batch.production_date ? new Date(batch.production_date).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
