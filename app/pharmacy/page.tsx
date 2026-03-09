'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { Package, CheckCircle, AlertTriangle, QrCode, Clock, ShieldCheck } from 'lucide-react';

export default function PharmacyPage() {
    const { account } = useWallet();
    const { transferBatch, loading, error } = useContract();

    const [batchId, setBatchId] = useState('');
    const [location, setLocation] = useState('');
    const [success, setSuccess] = useState(false);
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(true);
    const [showReceiveForm, setShowReceiveForm] = useState(false);

    useEffect(() => { fetchBatches(); }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/batches/list');
            if (res.ok) { const data = await res.json(); setBatches(Array.isArray(data) ? data : []); }
        } catch (e) { console.error(e); } finally { setLoadingBatches(false); }
    };

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        try {
            setSuccess(true);
            setBatchId(''); setLocation('');
        } catch (err) { console.error('Failed to confirm receipt:', err); }
    };

    const expiringSoon = batches.filter(b => {
        if (!b.expiry_date) return false;
        const exp = new Date(b.expiry_date);
        const now = new Date();
        const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
    });

    return (
        <DashboardShell>
            <PageHeader
                title="Inventory"
                description="Manage pharmacy inventory and receive medicine batches"
                icon={Package}
                actions={
                    <div className="flex gap-2">
                        <button onClick={() => setShowReceiveForm(!showReceiveForm)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
                            Receive Batch
                        </button>
                        <Link href="/verify"
                            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors">
                            Verify Batch
                        </Link>
                    </div>
                }
            />

            {/* Alert Banner */}
            {expiringSoon.length > 0 && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-300">
                        <span className="font-semibold">{expiringSoon.length} batch(es)</span> expiring within 30 days
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MetricCard icon={Package} label="Total Inventory" value={batches.length} color="emerald" />
                <MetricCard icon={Clock} label="Expiring Soon" value={expiringSoon.length} color="amber" />
                <MetricCard icon={CheckCircle} label="Delivered" value={batches.filter(b => b.status === 'DELIVERED').length} color="blue" />
            </div>

            {/* Receive Form — collapsible */}
            {showReceiveForm && (
                <div className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-base font-semibold text-gray-200">Receive Batch</h2>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">As a pharmacy, you are the final destination. Confirm receipt below.</p>
                    <form onSubmit={handleReceive} className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={batchId} onChange={e => setBatchId(e.target.value)}
                            placeholder="Batch ID (e.g., MED-2024-001)" required
                            className="flex-1 px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 transition-all" />
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                            placeholder="Pharmacy Location"
                            className="flex-1 px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/40 transition-all" />
                        <button type="submit" disabled={loading}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50">
                            {loading ? 'Confirming...' : 'Confirm Receipt'}
                        </button>
                    </form>
                    {error && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                    {success && <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">✅ Batch received! Status updated to DELIVERED.</div>}
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-base font-semibold text-gray-200">Inventory</h2>
                </div>
                {loadingBatches ? (
                    <div className="p-8 text-center text-gray-500">Loading inventory...</div>
                ) : batches.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No batches in inventory yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                                    <th className="text-left px-6 py-3 font-medium">Medicine</th>
                                    <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Quantity</th>
                                    <th className="text-left px-6 py-3 font-medium">Expiry</th>
                                    <th className="text-left px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/20">
                                {batches.map((batch: any) => {
                                    const isExpired = batch.expiry_date && new Date(batch.expiry_date) < new Date();
                                    return (
                                        <tr key={batch.id} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-3.5">
                                                <p className="text-sm font-medium text-gray-200">{batch.medicine_name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{batch.batch_id}</p>
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-400 hidden sm:table-cell">{batch.quantity}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`text-sm ${isExpired ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                                                    {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '—'}
                                                    {isExpired && ' ⚠️'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5"><StatusBadge status={batch.status || 'CREATED'} /></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
