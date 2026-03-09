'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { MissingLinkDetector } from '@/components/MissingLinkDetector';
import { QrCode, Shield, Package, Truck, Building2, CheckCircle, AlertTriangle, Search, Clock, MapPin, ExternalLink } from 'lucide-react';

interface BatchData {
    batch: any;
    transfers: any[];
    scans: any[];
    verification: {
        status: 'genuine' | 'suspicious' | 'counterfeit';
        trustScore: number;
        warnings: string[];
        missingLink?: string | null;
        isExpired: boolean;
        supplyChainComplete: boolean;
        scanCount: number;
        duplicateScans: number;
    };
}

export default function VerifyPage() {
    const params = useParams();
    const batchId = Array.isArray(params.batchId) ? params.batchId[0] : params.batchId;

    const [data, setData] = useState<BatchData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        if (batchId) { verifyBatch(batchId); }
        else { setLoading(false); }
    }, [batchId]);

    const verifyBatch = async (id: string) => {
        setLoading(true); setError('');
        try {
            const response = await fetch(`/api/verify/${id}`, { method: 'POST' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to verify batch');
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to verify batch');
        } finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId.trim()) {
            window.location.href = `/verify/${searchId.trim()}`;
        }
    };

    const getRoleIcon = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes('manufacturer')) return <Package className="w-4 h-4" />;
        if (r.includes('distributor')) return <Truck className="w-4 h-4" />;
        if (r.includes('pharmacy')) return <Building2 className="w-4 h-4" />;
        return <Shield className="w-4 h-4" />;
    };

    const statusConfig = {
        genuine: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: <CheckCircle className="w-10 h-10 text-emerald-400" /> },
        suspicious: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: <AlertTriangle className="w-10 h-10 text-amber-400" /> },
        counterfeit: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: <Shield className="w-10 h-10 text-red-400" /> },
    };

    return (
        <DashboardShell>
            <PageHeader title="QR Verification" description="Verify medicine authenticity by batch ID" icon={QrCode} />

            {/* Search bar */}
            {!batchId && (
                <div className="mb-8">
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
                                placeholder="Enter Batch ID to verify (e.g., MED-2024-001)"
                                className="w-full pl-12 pr-28 py-4 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all" />
                            <button type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
                                Verify
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Verifying batch...</p>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="max-w-2xl mx-auto p-8 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                    <Shield className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-red-300 mb-2">Verification Failed</h2>
                    <p className="text-red-400/80 text-sm">{error}</p>
                </div>
            )}

            {data && !loading && (
                <div className="space-y-6">
                    {/* Verification Result + Trust Score */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Result Card */}
                        <div className={`lg:col-span-2 p-6 rounded-xl border ${statusConfig[data.verification.status].bg} ${statusConfig[data.verification.status].border}`}>
                            <div className="flex items-center gap-4 mb-4">
                                {statusConfig[data.verification.status].icon}
                                <div>
                                    <h2 className={`text-2xl font-bold capitalize ${statusConfig[data.verification.status].text}`}>
                                        {data.verification.status}
                                    </h2>
                                    <p className="text-sm text-gray-400">Batch: {data.batch.batch_id}</p>
                                </div>
                            </div>
                            <TrustScoreBadge score={data.verification.trustScore} size="lg" showBreakdown />
                        </div>

                        {/* Batch Info */}
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Batch Details</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Medicine', value: data.batch.medicine_name },
                                    { label: 'Dosage', value: data.batch.dosage },
                                    { label: 'Quantity', value: `${data.batch.quantity} units` },
                                    { label: 'Mfg Date', value: data.batch.manufacturing_date ? new Date(data.batch.manufacturing_date).toLocaleDateString() : '—' },
                                    { label: 'Exp Date', value: data.batch.expiry_date ? new Date(data.batch.expiry_date).toLocaleDateString() : '—', warn: data.verification.isExpired },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between">
                                        <span className="text-xs text-gray-500">{item.label}</span>
                                        <span className={`text-sm font-medium ${item.warn ? 'text-red-400' : 'text-gray-200'}`}>
                                            {item.value} {item.warn ? '⚠️' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Warnings */}
                    {(data.verification.missingLink || data.verification.warnings.length > 0) && (
                        <MissingLinkDetector missingLink={data.verification.missingLink} warnings={data.verification.warnings} />
                    )}

                    {/* Supply Chain Timeline */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                        <h3 className="text-base font-semibold text-gray-200 mb-5">Supply Chain Timeline</h3>
                        {data.transfers.length === 0 ? (
                            <p className="text-sm text-gray-500">No transfers recorded yet</p>
                        ) : (
                            <div className="relative">
                                {data.transfers.map((transfer, index) => (
                                    <div key={transfer.id} className="flex gap-4 pb-6 last:pb-0">
                                        <div className="flex flex-col items-center">
                                            <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                                {getRoleIcon(transfer.to_role)}
                                            </div>
                                            {index < data.transfers.length - 1 && <div className="w-px flex-1 bg-gray-700/50 mt-2"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0 pb-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-200 capitalize">{transfer.to_role}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(transfer.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-mono truncate">{transfer.to_address}</p>
                                            {transfer.location && (
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {transfer.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Scan History */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                        <h3 className="text-base font-semibold text-gray-200 mb-3">
                            Scan History ({data.verification.scanCount} scans)
                        </h3>
                        {data.verification.duplicateScans > 0 && (
                            <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <p className="text-sm text-amber-300">{data.verification.duplicateScans} duplicate scan(s) detected</p>
                            </div>
                        )}
                        <p className="text-sm text-gray-500">This batch has been scanned {data.verification.scanCount} time(s)</p>
                    </div>
                </div>
            )}
        </DashboardShell>
    );
}
