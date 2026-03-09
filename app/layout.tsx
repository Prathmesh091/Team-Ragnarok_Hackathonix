import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './mobile-fixes.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { cn } from "@/lib/utils";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const metadata: Metadata = {
    title: 'Veridion — Trust the Origin. Track the Journey.',
    description: 'Blockchain-powered product supply chain verification platform. Track any product from origin to shelf.',
    keywords: ['blockchain', 'supply chain', 'product tracking', 'verification', 'counterfeit prevention', 'veridion'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={cn("dark", inter.variable)}>
            <body className={inter.className}>
                <AuthProvider>
                    <WalletProvider>
                        {children}
                    </WalletProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
