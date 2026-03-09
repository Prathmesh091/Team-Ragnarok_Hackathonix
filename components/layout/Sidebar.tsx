'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Plus, ArrowLeftRight, Package, QrCode,
    BarChart3, ScanLine, Settings, Shield, ChevronLeft, ChevronRight,
    LogOut, UserCircle, Building, MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, ROLE_LABELS } from '@/lib/roles';

interface NavItemProps {
    href: string;
    icon: React.ElementType;
    label: string;
    collapsed: boolean;
    active: boolean;
    color?: string;
}

function NavItem({ href, icon: Icon, label, collapsed, active, color }: NavItemProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                    ? `bg-emerald-500/15 text-emerald-400 border border-emerald-500/20`
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }
                ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? label : undefined}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-emerald-400' : ''}`} />
            {!collapsed && <span className="truncate">{label}</span>}
        </Link>
    );
}

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user, userRole, logout } = useAuth();

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/manufacturer', icon: Plus, label: 'Create' },
        { href: '/distributor', icon: ArrowLeftRight, label: 'Transfers' },
        { href: '/tracking', icon: MapPin, label: 'Live Tracking' },
        { href: '/verify', icon: QrCode, label: 'Verify Product' },
        { href: '/analytics', icon: BarChart3, label: 'Analytics' },
        { href: '/hospital/bulk-verify', icon: ScanLine, label: 'Bulk Verify' },
        { href: '/admin', icon: Settings, label: 'Admin' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 
                        flex flex-col z-40 transition-all duration-300
                        ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
        >
            {/* Logo */}
            <div className={`flex items-center h-16 px-4 border-b border-gray-800 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
                <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                {!collapsed && (
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Veridion
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        {...item}
                        collapsed={collapsed}
                        active={pathname === item.href || pathname.startsWith(item.href + '/')}
                    />
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-gray-800 p-3 space-y-2">
                {!collapsed && user && (
                    <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-200 truncate">{user.full_name || 'User'}</p>
                        {userRole && (
                            <p className="text-xs text-emerald-400/80 font-medium">{ROLE_LABELS[userRole]}</p>
                        )}
                    </div>
                )}
                <button
                    onClick={() => logout()}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                               text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full
                               ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full
                           flex items-center justify-center text-gray-400 hover:text-gray-200
                           hover:bg-gray-700 transition-all z-50"
            >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
        </aside>
    );
}
