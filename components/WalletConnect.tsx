'use client';

import { useWallet } from '@/contexts/WalletContext';
import { getRoleName } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';

export function WalletConnect() {
    const { account, role, isConnecting, error, connect, disconnect, isConnected } = useWallet();

    if (isConnected && account) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <div className="text-sm font-medium">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {getRoleName(role)}
                    </div>
                </div>
                <button
                    onClick={disconnect}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {error && (
                <div className="text-sm text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
}
