'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrustScoreBadge } from '@/components/TrustScoreBadge';
import { MissingLinkDetector } from '@/components/MissingLinkDetector';
import {
    MapPin, Search, Package, Truck, Building2, Shield, CheckCircle,
    AlertTriangle, Clock, ExternalLink, Hash, User, ArrowRight
} from 'lucide-react';

// Dynamically import Leaflet map (no SSR)
const TrackingMap = lazy(() =>
    import('@/components/features/TrackingMap').then(mod => ({ default: mod.TrackingMap }))
);

// Supply chain location coordinates (Indian cities for demo)
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.076, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Hyderabad': { lat: 17.385, lng: 78.4867 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
};

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

const SUPPLY_CHAIN_STAGES = [
    { key: 'manufacturer', label: 'Manufactured', icon: Package, color: 'emerald' },
    { key: 'distributor', label: 'Shipped to Distributor', icon: Truck, color: 'amber' },
    { key: 'pharmacy', label: 'Received by Retailer', icon: Building2, color: 'blue' },
    { key: 'delivered', label: 'Available for Sale', icon: CheckCircle, color: 'emerald' },
];

export default function TrackingPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<BatchData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true); setError(''); setData(null);
        try {
            const res = await fetch(`/api/verify/${searchQuery.trim()}`, { method: 'POST' });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Batch not found');
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to track batch');
        } finally { setLoading(false); }
    };

    // Build map locations from transfers
    const getMapLocations = () => {
        if (!data) return [];
        const locations: Array<{ lat: number; lng: number; label: string; role: string; timestamp: string; isActive: boolean }> = [];

        // Add manufacturer as origin
        const mfgCity = Object.keys(LOCATION_COORDS)[0]; // Default Mumbai
        locations.push({
            ...LOCATION_COORDS[mfgCity],
            label: mfgCity,
            role: 'Manufacturer',
            timestamp: data.batch.manufacturing_date || data.batch.created_at,
            isActive: data.transfers.length === 0,
        });

        // Add each transfer
        data.transfers.forEach((transfer, i) => {
            const loc = transfer.location || '';
            const cityMatch = Object.keys(LOCATION_COORDS).find(city =>
                loc.toLowerCase().includes(city.toLowerCase())
            );
            const coords = cityMatch ? LOCATION_COORDS[cityMatch] : LOCATION_COORDS[Object.keys(LOCATION_COORDS)[(i + 1) % Object.keys(LOCATION_COORDS).length]];
            locations.push({
                ...coords,
                label: loc || `Transfer ${i + 1}`,
                role: transfer.to_role || 'Transfer',
                timestamp: transfer.timestamp,
                isActive: i === data.transfers.length - 1,
            });
        });

        return locations;
    };

    // Get current stage index
    const getCurrentStage = () => {
        if (!data) return -1;
        if (data.batch.status === 'DELIVERED') return 3;
        if (data.transfers.some((t: any) => t.to_role?.toLowerCase().includes('pharmacy'))) return 2;
        if (data.transfers.some((t: any) => t.to_role?.toLowerCase().includes('distributor'))) return 1;
        return 0;
    };

    const getCurrentLocation = () => {
        if (!data) return 'Unknown';
        if (data.transfers.length === 0) return 'Manufacturer';
        const lastTransfer = data.transfers[data.transfers.length - 1];
        return lastTransfer.location || lastTransfer.to_role || 'In Transit';
    };

    return (
        <DashboardShell>
            <PageHeader title="Live Supply Chain Tracking" description="Track medicine batch movement through the supply chain in real time" icon={MapPin} />

            {/* Search Bar */}
            <div className="mb-8">
                <form onSubmit={handleSearch} className="relative max-w-3xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by Batch ID, QR code value, or Transaction Hash..."
                        className="w-full pl-12 pr-28 py-4 bg-gray-800/60 border border-gray-700 rounded-xl text-gray-200 text-sm placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
                    />
                    <button type="submit" disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50">
                        {loading ? 'Tracking...' : 'Track'}
                    </button>
                </form>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Tracking batch through supply chain...</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="max-w-2xl mx-auto p-8 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-red-300 mb-2">Batch Not Found</h2>
                    <p className="text-red-400/80 text-sm">{error}</p>
                </div>
            )}

            {/* Results */}
            {data && !loading && (
                <div className="space-y-6">
                    {/* Status Card + Trust Score */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <MetricCard icon={MapPin} label="Current Location"
                            value={getCurrentLocation()} color="emerald" />
                        <MetricCard icon={Package} label="Status"
                            value={data.batch.status?.replace(/_/g, ' ') || 'CREATED'} color="blue" />
                        <MetricCard icon={Clock} label="Last Updated"
                            value={data.transfers.length > 0
                                ? new Date(data.transfers[data.transfers.length - 1].timestamp).toLocaleDateString()
                                : 'No transfers'
                            } color="amber" />
                        <MetricCard icon={Shield} label="Trust Score"
                            value={`${data.verification.trustScore}/100`}
                            color={data.verification.trustScore >= 80 ? 'emerald' : data.verification.trustScore >= 50 ? 'amber' : 'red'} />
                    </div>

                    {/* Counterfeit Warning */}
                    {(data.verification.missingLink || data.verification.warnings.length > 0) && (
                        <MissingLinkDetector missingLink={data.verification.missingLink} warnings={data.verification.warnings} />
                    )}

                    {/* Supply Chain Timeline */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                        <h2 className="text-base font-semibold text-gray-200 mb-6">Supply Chain Timeline</h2>

                        {/* Horizontal timeline */}
                        <div className="relative">
                            <div className="flex items-center justify-between mb-8">
                                {SUPPLY_CHAIN_STAGES.map((stage, i) => {
                                    const currentStage = getCurrentStage();
                                    const isCompleted = i <= currentStage;
                                    const isCurrent = i === currentStage;
                                    const Icon = stage.icon;

                                    return (
                                        <div key={stage.key} className="flex flex-col items-center relative flex-1">
                                            {/* Connector line */}
                                            {i > 0 && (
                                                <div className={`absolute top-5 -left-1/2 right-1/2 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-700'
                                                    }`}></div>
                                            )}
                                            {/* Node */}
                                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCurrent
                                                    ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/30'
                                                    : isCompleted
                                                        ? 'bg-emerald-500/15 border-emerald-500/50'
                                                        : 'bg-gray-800 border-gray-600'
                                                }`}>
                                                <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-gray-500'}`} />
                                                {isCurrent && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                                )}
                                            </div>
                                            <span className={`mt-2 text-xs font-medium text-center ${isCompleted ? 'text-gray-200' : 'text-gray-500'
                                                }`}>{stage.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Transfer details */}
                        {data.transfers.length > 0 && (
                            <div className="border-t border-gray-700/50 pt-4 space-y-3">
                                {data.transfers.map((transfer, i) => (
                                    <div key={transfer.id || i} className="flex items-center gap-4 p-3 bg-gray-900/40 rounded-lg hover:bg-gray-900/60 transition-colors">
                                        <div className="w-8 h-8 bg-emerald-500/15 rounded-full flex items-center justify-center">
                                            {transfer.to_role?.toLowerCase().includes('distributor')
                                                ? <Truck className="w-4 h-4 text-emerald-400" />
                                                : transfer.to_role?.toLowerCase().includes('pharmacy')
                                                    ? <Building2 className="w-4 h-4 text-blue-400" />
                                                    : <Package className="w-4 h-4 text-amber-400" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-200 capitalize">{transfer.to_role || 'Transfer'}</p>
                                            <p className="text-xs text-gray-500 font-mono truncate">{transfer.to_address}</p>
                                        </div>
                                        <div className="text-right">
                                            {transfer.location && (
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {transfer.location}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">{new Date(transfer.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leaflet Map */}
                    {getMapLocations().length > 0 && (
                        <Suspense fallback={
                            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 h-[400px] flex items-center justify-center">
                                <p className="text-gray-500 text-sm">Loading map...</p>
                            </div>
                        }>
                            <TrackingMap locations={getMapLocations()} />
                        </Suspense>
                    )}

                    {/* Transaction History Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700/50">
                            <h2 className="text-base font-semibold text-gray-200">Transaction History</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                                        <th className="text-left px-6 py-3 font-medium">Stage</th>
                                        <th className="text-left px-6 py-3 font-medium">Actor</th>
                                        <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Wallet Address</th>
                                        <th className="text-left px-6 py-3 font-medium">Location</th>
                                        <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Timestamp</th>
                                        <th className="text-left px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/20">
                                    {/* Creation row */}
                                    <tr className="hover:bg-gray-700/20 transition-colors">
                                        <td className="px-6 py-3.5 text-sm text-gray-300">Created</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-300">Manufacturer</td>
                                        <td className="px-6 py-3.5 text-xs font-mono text-gray-400 hidden sm:table-cell truncate max-w-[140px]">
                                            {data.batch.manufacturer_address}
                                        </td>
                                        <td className="px-6 py-3.5 text-sm text-gray-400">Origin</td>
                                        <td className="px-6 py-3.5 text-xs text-gray-500 hidden md:table-cell">
                                            {data.batch.created_at ? new Date(data.batch.created_at).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-6 py-3.5"><StatusBadge status="CREATED" /></td>
                                    </tr>
                                    {/* Transfer rows */}
                                    {data.transfers.map((transfer, i) => (
                                        <tr key={transfer.id || i} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-3.5 text-sm text-gray-300 capitalize">{transfer.to_role || `Transfer ${i + 1}`}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-300 capitalize">{transfer.to_role || 'Actor'}</td>
                                            <td className="px-6 py-3.5 text-xs font-mono text-gray-400 hidden sm:table-cell truncate max-w-[140px]">
                                                {transfer.to_address}
                                            </td>
                                            <td className="px-6 py-3.5 text-sm text-gray-400">{transfer.location || '—'}</td>
                                            <td className="px-6 py-3.5 text-xs text-gray-500 hidden md:table-cell">
                                                {new Date(transfer.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-3.5"><StatusBadge status={i === data.transfers.length - 1 ? 'IN_TRANSIT' : 'DELIVERED'} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Batch Details + Trust Score */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                            <h3 className="text-base font-semibold text-gray-200 mb-4">Batch Information</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Batch ID', value: data.batch.batch_id, mono: true },
                                    { label: 'Medicine', value: data.batch.medicine_name },
                                    { label: 'Dosage', value: data.batch.dosage },
                                    { label: 'Quantity', value: `${data.batch.quantity} units` },
                                    { label: 'Mfg Date', value: data.batch.manufacturing_date ? new Date(data.batch.manufacturing_date).toLocaleDateString() : '—' },
                                    { label: 'Exp Date', value: data.batch.expiry_date ? new Date(data.batch.expiry_date).toLocaleDateString() : '—', warn: data.verification.isExpired },
                                ].map((item) => (
                                    <div key={item.label} className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                                        <span className={`text-sm font-medium ${item.warn ? 'text-red-400' : item.mono ? 'font-mono text-emerald-400' : 'text-gray-200'}`}>
                                            {item.value} {item.warn ? '⚠️ EXPIRED' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                            <h3 className="text-base font-semibold text-gray-200 mb-4">Trust & Authenticity</h3>
                            <TrustScoreBadge score={data.verification.trustScore} size="lg" showBreakdown />
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Supply Chain</span>
                                    <span className={`text-sm font-medium ${data.verification.supplyChainComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {data.verification.supplyChainComplete ? '✅ Complete' : '⚠️ Incomplete'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Scan Count</span>
                                    <span className="text-sm text-gray-200">{data.verification.scanCount}</span>
                                </div>
                                {data.verification.duplicateScans > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Duplicates</span>
                                        <span className="text-sm text-red-400">{data.verification.duplicateScans} detected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!data && !loading && !error && (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/50">
                        <MapPin className="w-8 h-8 text-gray-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Track a Medicine Batch</h2>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Enter a Batch ID above to see its journey through the supply chain with real-time location tracking and verification status.
                    </p>
                </div>
            )}
        </DashboardShell>
    );
}
