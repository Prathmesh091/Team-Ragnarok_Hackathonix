'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BarChart3, Package, Shield, AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface AnalyticsData {
    totalBatches: number;
    flaggedBatches: number;
    lowTrustBatches: number;
    counterfeitAttempts: number;
    eventCounts: Record<string, number>;
    manufacturerRankings: Array<{ address: string; avgTrustScore: number; batchCount: number; }>;
    flaggedCount: number;
    recentEvents: Array<{ event_type: string; batch_id?: string; timestamp: string; severity: string; }>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAnalytics(); }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics/counterfeit');
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (e) { console.error('Failed to fetch analytics:', e); }
        finally { setLoading(false); }
    };

    const genuineRate = data ? Math.round(((data.totalBatches - data.flaggedBatches) / Math.max(data.totalBatches, 1)) * 100) : 0;

    return (
        <DashboardShell>
            <PageHeader title="Analytics" description="Supply chain metrics and fraud detection" icon={BarChart3} />

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard icon={Package} label="Total Batches" value={loading ? '—' : (data?.totalBatches || 0)} color="emerald" />
                <MetricCard icon={Shield} label="Genuine Rate" value={loading ? '—' : `${genuineRate}%`} color="blue" />
                <MetricCard icon={AlertTriangle} label="Flagged" value={loading ? '—' : (data?.flaggedBatches || 0)} color="amber" />
                <MetricCard icon={Activity} label="Events" value={loading ? '—' : (data?.recentEvents?.length || 0)} color="purple" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Manufacturer Rankings */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700/50">
                            <h2 className="text-base font-semibold text-gray-200">Manufacturer Rankings</h2>
                        </div>
                        {!data?.manufacturerRankings?.length ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No manufacturer data yet</div>
                        ) : (
                            <div className="divide-y divide-gray-700/30">
                                {data.manufacturerRankings.map((mfr, i) => (
                                    <div key={mfr.address} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-700/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                                ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
                                                {i + 1}
                                            </span>
                                            <span className="text-sm text-gray-300 font-mono truncate max-w-[180px]">{mfr.address}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">{mfr.batchCount} batches</span>
                                            <span className={`text-sm font-semibold ${mfr.avgTrustScore >= 80 ? 'text-emerald-400' :
                                                    mfr.avgTrustScore >= 50 ? 'text-amber-400' : 'text-red-400'
                                                }`}>
                                                {Math.round(mfr.avgTrustScore)}/100
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Security Events */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700/50">
                            <h2 className="text-base font-semibold text-gray-200">Security Events</h2>
                        </div>
                        {!data?.recentEvents?.length ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No security events recorded</div>
                        ) : (
                            <div className="divide-y divide-gray-700/30 max-h-[400px] overflow-y-auto">
                                {data.recentEvents.map((event, i) => (
                                    <div key={i} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-700/20 transition-colors">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.severity === 'CRITICAL' ? 'bg-red-400' :
                                                event.severity === 'WARNING' ? 'bg-amber-400' :
                                                    event.severity === 'ERROR' ? 'bg-red-400' : 'bg-blue-400'
                                            }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300">{event.event_type.replace(/_/g, ' ')}</p>
                                            {event.batch_id && <p className="text-xs text-gray-500 font-mono">{event.batch_id}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={event.severity} />
                                            <span className="text-xs text-gray-600 hidden sm:block">
                                                {new Date(event.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Event Type Breakdown */}
                    {data?.eventCounts && Object.keys(data.eventCounts).length > 0 && (
                        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                            <h2 className="text-base font-semibold text-gray-200 mb-4">Event Breakdown</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(data.eventCounts).map(([event, count]) => (
                                    <div key={event} className="bg-gray-900/50 rounded-lg p-4 text-center">
                                        <p className="text-2xl font-bold text-gray-200 mb-1">{count}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{event.replace(/_/g, ' ')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardShell>
    );
}
