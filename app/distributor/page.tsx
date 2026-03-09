'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { ArrowLeftRight, Package, Send, Inbox, CheckCircle, ArrowRight } from 'lucide-react';

export default function DistributorPage() {
    const { account } = useWallet();
    const { transferBatch, loading, error } = useContract();

    const [batchId, setBatchId] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [location, setLocation] = useState('');
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
        try {
            await transferBatch(batchId, recipientAddress, location);
            setSuccess(true);
            setBatchId(''); setRecipientAddress(''); setLocation('');
        } catch (err) { console.error('Failed to transfer batch:', err); }
    };

    const inTransit = batches.filter(b => b.status === 'IN_TRANSIT').length;
    const received = batches.filter(b => b.status === 'DELIVERED').length;

    return (
        <DashboardShell>
            <PageHeader
                title="Transfers"
                description="Transfer medicine batches through the supply chain"
                icon={ArrowLeftRight}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MetricCard icon={Package} label="In Stock" value={batches.length} color="emerald" />
                <MetricCard icon={Inbox} label="In Transit" value={inTransit} color="amber" />
                <MetricCard icon={CheckCircle} label="Delivered" value={received} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transfer Form */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Send className="w-5 h-5 text-amber-400" />
                        <h2 className="text-base font-semibold text-gray-200">Transfer Batch</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Batch ID *</label>
                            <input type="text" value={batchId} onChange={e => setBatchId(e.target.value)}
                                placeholder="e.g., MED-2024-001" required
                                className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Recipient Address *</label>
                            <input type="text" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)}
                                placeholder="0x..." required
                                className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm font-mono text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Location</label>
                            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                                placeholder="e.g., Warehouse A, Mumbai"
                                className="w-full px-3.5 py-2.5 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all" />
                        </div>

                        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                        {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">✅ Batch transferred successfully!</div>}

                        <button type="submit" disabled={loading}
                            className="w-full px-5 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Transferring...' : 'Transfer Batch'}
                        </button>
                    </form>
                </div>

                {/* Recent Transfers */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-700/50">
                        <h2 className="text-base font-semibold text-gray-200">Recent Batches</h2>
                    </div>
                    <div className="divide-y divide-gray-700/30">
                        {loadingBatches ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : batches.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No batches found</div>
                        ) : (
                            batches.slice(0, 8).map((batch: any, i: number) => (
                                <div key={batch.id || i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-700/20 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{batch.medicine_name || batch.batch_id}</p>
                                        <p className="text-xs text-gray-500 font-mono">{batch.batch_id}</p>
                                    </div>
                                    <StatusBadge status={batch.status || 'CREATED'} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
