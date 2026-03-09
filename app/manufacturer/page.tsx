'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Factory, Package, Plus, QrCode, Clock, CheckCircle } from 'lucide-react';
import { ethers } from 'ethers';

export default function ManufacturerPage() {
    const { account } = useWallet();
    const { createBatch, loading, error } = useContract();

    const [formData, setFormData] = useState({
        batchId: '', medicineName: '', dosage: '', quantity: '',
        manufacturingDate: '', expiryDate: '', manufacturer: ''
    });
    const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(true);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/batches/list');
            if (res.ok) { const data = await res.json(); setBatches(Array.isArray(data) ? data : []); }
        } catch (e) { console.error(e); } finally { setLoadingBatches(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setCreatedBatchId(null);
        try {
            const batchId = formData.batchId || `MED-${Date.now()}`;

            // Save to database first (no gas required)
            const dbRes = await fetch('/api/batches/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batch_id: batchId,
                    medicine_name: formData.medicineName,
                    dosage: formData.dosage,
                    quantity: parseInt(formData.quantity),
                    manufacturing_date: formData.manufacturingDate,
                    expiry_date: formData.expiryDate,
                    manufacturer_address: formData.manufacturer || account || 'demo-manufacturer',
                }),
            });

            if (!dbRes.ok) {
                const errData = await dbRes.json();
                throw new Error(errData.error || 'Failed to save batch');
            }

            // Optionally record on blockchain (non-blocking — skip if wallet not connected)
            if (account) {
                try {
                    const expTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000);
                    const metadataHash = ethers.id(`${batchId}-${formData.medicineName}-${formData.manufacturer || account}`);
                    await createBatch(batchId, expTimestamp, metadataHash);
                } catch (blockchainErr) {
                    console.warn('Blockchain recording skipped (wallet issue or no gas):', blockchainErr);
                }
            }

            setCreatedBatchId(batchId);
            setSuccess(true);
            setFormData({ batchId: '', medicineName: '', dosage: '', quantity: '', manufacturingDate: '', expiryDate: '', manufacturer: '' });
            fetchBatches();
        } catch (err: any) {
            console.error('Failed to create batch:', err);
        }
    };

    return (
        <DashboardShell>
            <PageHeader
                title="Create Batch"
                description="Register a new medicine batch on the blockchain and generate its QR code"
                icon={Factory}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MetricCard icon={Package} label="Total Batches" value={batches.length} color="emerald" />
                <MetricCard icon={Clock} label="In Transit" value={batches.filter(b => b.status === 'IN_TRANSIT').length} color="amber" />
                <MetricCard icon={CheckCircle} label="Delivered" value={batches.filter(b => b.status === 'DELIVERED').length} color="blue" />
            </div>

            {/* Form + QR Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                {/* Form — 3/5 */}
                <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Plus className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-gray-200">Batch Details</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Batch ID</label>
                                <input type="text" value={formData.batchId} onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                                    placeholder="Auto-generated if empty"
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Medicine Name *</label>
                                <input type="text" value={formData.medicineName} onChange={e => setFormData({ ...formData, medicineName: e.target.value })}
                                    placeholder="e.g., Paracetamol 500mg" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Dosage</label>
                                <input type="text" value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                    placeholder="e.g., 500mg"
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Quantity *</label>
                                <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    placeholder="1000" required
                                    className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Manufacturing Date *</label>
                                <input type="date" value={formData.manufacturingDate} onChange={e => setFormData({ ...formData, manufacturingDate: e.target.value })}
                                    required className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Expiry Date *</label>
                                <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    required className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">✅ Batch created successfully!</div>}

                        <button type="submit" disabled={loading}
                            className="w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating...' : 'Create Batch & Generate QR'}
                        </button>
                    </form>
                </div>

                {/* QR Preview — 2/5 */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2 mb-5 self-start">
                        <QrCode className="w-5 h-5 text-purple-400" />
                        <h2 className="text-base font-semibold text-gray-200">QR Code Preview</h2>
                    </div>
                    {createdBatchId ? (
                        <QRCodeGenerator batchId={createdBatchId} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <div className="w-32 h-32 bg-gray-700/30 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-600">
                                <QrCode className="w-12 h-12 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500">QR code will appear here<br />after batch creation</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Batch History Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-base font-semibold text-gray-200">Batch History</h2>
                </div>
                {loadingBatches ? (
                    <div className="p-8 text-center text-gray-500">Loading batches...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No batches created yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                                    <th className="text-left px-6 py-3 font-medium">Batch ID</th>
                                    <th className="text-left px-6 py-3 font-medium">Medicine</th>
                                    <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Quantity</th>
                                    <th className="text-left px-6 py-3 font-medium">Status</th>
                                    <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/20">
                                {batches.map((batch: any) => (
                                    <tr key={batch.id} className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-3.5 text-sm font-mono text-emerald-400">{batch.batch_id}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-300">{batch.medicine_name}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-400 hidden sm:table-cell">{batch.quantity}</td>
                                        <td className="px-6 py-3.5"><StatusBadge status={batch.status || 'CREATED'} /></td>
                                        <td className="px-6 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                                            {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : '—'}
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
