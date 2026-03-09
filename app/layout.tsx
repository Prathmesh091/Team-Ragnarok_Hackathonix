import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './mobile-fixes.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'MediChain - Tamper-Proof Medicine Supply Chain',
    description: 'Blockchain-based medicine supply chain verification platform preventing counterfeit medicines',
    keywords: ['blockchain', 'medicine', 'supply chain', 'verification', 'counterfeit prevention'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
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
