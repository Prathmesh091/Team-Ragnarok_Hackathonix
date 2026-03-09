import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format Ethereum address for display
 */
export function formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Check if batch is expired
 */
export function isExpired(expiryDate: number): boolean {
    return Date.now() / 1000 > expiryDate;
}

/**
 * Get role name from enum
 */
export function getRoleName(role: number): string {
    const roles = ['None', 'Manufacturer', 'Distributor', 'Vendor', 'Hospital', 'Customer'];
    return roles[role] || 'Unknown';
}

/**
 * Get status name from enum
 */
export function getStatusName(status: number): string {
    const statuses = ['Created', 'In Transit', 'Delivered', 'Flagged'];
    return statuses[status] || 'Unknown';
}

/**
 * Get status color
 */
export function getStatusColor(status: number): string {
    const colors = [
        'bg-blue-500',    // Created
        'bg-yellow-500',  // In Transit
        'bg-green-500',   // Delivered
        'bg-red-500',     // Flagged
    ];
    return colors[status] || 'bg-gray-500';
}

/**
 * Generate random nonce
 */
export function generateNonce(): string {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}
