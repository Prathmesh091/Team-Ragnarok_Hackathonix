'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { WalletConnect } from '@/components/WalletConnect';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { USER_ROLES, ROLE_LABELS, type UserRole } from '@/lib/roles';
import {
    LayoutDashboard, Package, ArrowLeftRight, Shield, AlertTriangle,
    CheckCircle2, TrendingUp, BarChart3, Clock, Factory, Truck, Building2,
    ArrowRight, QrCode, MapPin, Wallet
} from 'lucide-react';

interface DashboardStats {
    totalBatches: number;
    inTransit: number;
    delivered: number;
    flagged: number;
    recentTransfers: any[];
}

export default function Dashboard() {
    const { user, userRole } = useAuth();
    const { isConnected, account } = useWallet();
    const [stats, setStats] = useState<DashboardStats>({
        totalBatches: 0, inTransit: 0, delivered: 0, flagged: 0, recentTransfers: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/batches/list');
            if (res.ok) {
                const batches = await res.json();
                const arr = Array.isArray(batches) ? batches : [];
                setStats({
                    totalBatches: arr.length,
                    inTransit: arr.filter((b: any) => b.status === 'IN_TRANSIT').length,
                    delivered: arr.filter((b: any) => b.status === 'DELIVERED').length,
                    flagged: arr.filter((b: any) => b.status === 'FLAGGED').length,
                    recentTransfers: arr.slice(0, 5),
                });
            }
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { href: '/manufacturer', icon: Factory, label: 'Create Batch', desc: 'Generate new medicine batch + QR', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20 hover:border-emerald-500/40' },
        { href: '/distributor', icon: Truck, label: 'Transfer Batch', desc: 'Move batch through supply chain', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20 hover:border-amber-500/40' },
        { href: '/tracking', icon: MapPin, label: 'Live Tracking', desc: 'Track batch through supply chain', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20 hover:border-blue-500/40' },
        { href: '/verify', icon: QrCode, label: 'Verify Medicine', desc: 'Scan QR to check authenticity', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20 hover:border-purple-500/40' },
    ];

    return (
        <DashboardShell>
            <PageHeader
                title={`Welcome back, ${user?.full_name || 'User'}`}
                description={userRole ? `${ROLE_LABELS[userRole]} — Blockchain-powered medicine verification` : 'Your medicine verification platform'}
                icon={LayoutDashboard}
                actions={
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-mono text-emerald-400 hidden sm:block">
                                    {account?.slice(0, 6)}...{account?.slice(-4)}
                                </span>
                                <span className="text-xs text-emerald-400 sm:hidden">Connected</span>
                            </div>
                        ) : (
                            <WalletConnect />
                        )}
                    </div>
                }
            />

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard icon={Package} label="Total Batches" value={loading ? '—' : stats.totalBatches} color="emerald" />
                <MetricCard icon={ArrowLeftRight} label="In Transit" value={loading ? '—' : stats.inTransit} color="amber" />
                <MetricCard icon={CheckCircle2} label="Delivered" value={loading ? '—' : stats.delivered} color="blue" />
                <MetricCard icon={AlertTriangle} label="Flagged" value={loading ? '—' : stats.flagged} color="red" />
            </div>

            {/* Main Grid: Recent Batches + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Batches — 2/3 width */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                        <h2 className="text-base font-semibold text-gray-200">Recent Batches</h2>
                        <Link href="/analytics" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-700/30">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading...</div>
                        ) : stats.recentTransfers.length === 0 ? (
                            <div className="p-8 text-center">
                                <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No batches yet. Create your first batch!</p>
                                <Link href="/manufacturer" className="text-emerald-400 text-sm font-medium mt-2 inline-block hover:underline">
                                    Create Batch →
                                </Link>
                            </div>
                        ) : (
                            stats.recentTransfers.map((batch: any, i: number) => (
                                <Link key={batch.id || i} href={`/verify/${batch.batch_id}`}
                                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-700/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                            <Package className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-200">{batch.medicine_name || batch.batch_id}</p>
                                            <p className="text-xs text-gray-500">{batch.batch_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <StatusBadge status={batch.status || 'CREATED'} />
                                        <span className="text-xs text-gray-500 hidden sm:block">
                                            {batch.created_at ? new Date(batch.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions — 1/3 width */}
                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-gray-200 mb-2">Quick Actions</h2>
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.href} href={action.href}
                                className={`group flex items-center gap-3 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border ${action.border} transition-all hover:shadow-lg`}>
                                <div className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-5 h-5 ${action.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-200">{action.label}</p>
                                    <p className="text-xs text-gray-500 truncate">{action.desc}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </Link>
                        );
                    })}
                </div>
            </div>

            <DemoModeToggle />
        </DashboardShell>
    );
}
