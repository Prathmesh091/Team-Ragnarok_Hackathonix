'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
    Shield, ArrowRight, QrCode, MapPin, BarChart3, Package,
    Truck, Building2, ChevronRight, CheckCircle, Globe, Lock,
    Zap, Eye, Layers, Cpu
} from 'lucide-react';

export default function LandingPage() {
    const { user } = useAuth();

    const features = [
        {
            icon: Shield,
            title: 'Blockchain Verified',
            description: 'Every product is tracked on an immutable blockchain ledger ensuring zero tampering.',
            color: 'from-emerald-500 to-teal-500',
        },
        {
            icon: QrCode,
            title: 'Instant QR Verification',
            description: 'Scan any product QR code to instantly verify authenticity and view its full journey.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: MapPin,
            title: 'Live Supply Chain Tracking',
            description: 'Track products in real time across the entire supply chain with interactive maps.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Eye,
            title: 'Counterfeit Detection',
            description: 'AI-powered anomaly detection and trust scoring to flag suspicious supply chain activity.',
            color: 'from-amber-500 to-orange-500',
        },
    ];

    const industries = [
        { icon: Cpu, label: 'Electronics', count: '2.4M+' },
        { icon: Package, label: 'Pharmaceuticals', count: '8.1M+' },
        { icon: Layers, label: 'Food & Beverages', count: '5.7M+' },
        { icon: Globe, label: 'Luxury Goods', count: '1.2M+' },
        { icon: Truck, label: 'Automotive', count: '3.5M+' },
        { icon: Building2, label: 'Logistics', count: '6.8M+' },
    ];

    const steps = [
        { step: '01', title: 'Register Product', desc: 'Producer registers a product batch with details, generating a unique blockchain entry and QR code.' },
        { step: '02', title: 'Track Movement', desc: 'Every transfer — warehouse, logistics, vendor — is recorded on-chain with timestamps and locations.' },
        { step: '03', title: 'Verify Authenticity', desc: 'Anyone scans the QR code to see the full supply chain journey and trust score instantly.' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Shield className="w-8 h-8 text-emerald-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Veridion
                        </span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">How it Works</a>
                        <a href="#industries" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">Industries</a>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/dashboard" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-gray-300 text-sm font-medium hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400">Blockchain-Powered Verification</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                            Trust the Origin.
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                            Track the Journey.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Veridion is a universal product supply chain verification platform.
                        Track any product — electronics, pharmaceuticals, food, luxury goods — from origin to shelf.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup"
                            className="group px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center gap-2">
                            Start Tracking
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/verify"
                            className="px-8 py-3.5 bg-gray-800/60 border border-gray-700 text-gray-200 rounded-xl text-base font-medium hover:bg-gray-800 transition-all flex items-center gap-2">
                            <QrCode className="w-4 h-4" /> Verify a Product
                        </Link>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {[
                            { value: '27M+', label: 'Products Tracked' },
                            { value: '180+', label: 'Countries' },
                            { value: '99.7%', label: 'Accuracy' },
                            { value: '<2s', label: 'Verification Time' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Complete Trust</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Every step in the supply chain is verified, timestamped, and immutable.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title}
                                    className="group p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all hover:shadow-xl">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 border-t border-gray-800/50 bg-gray-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Veridion Works</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Three simple steps to build an unbreakable chain of trust.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((item) => (
                            <div key={item.step} className="relative">
                                <div className="text-6xl font-black text-emerald-500/10 mb-2">{item.step}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Industries */}
            <section id="industries" className="py-20 border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Every Industry</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">One platform. Every product. Complete supply chain visibility.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {industries.map((ind) => {
                            const Icon = ind.icon;
                            return (
                                <div key={ind.label}
                                    className="group p-5 bg-gray-900/50 border border-gray-800 rounded-xl text-center hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                                    <Icon className="w-8 h-8 text-gray-500 group-hover:text-emerald-400 transition-colors mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-gray-200 mb-1">{ind.label}</p>
                                    <p className="text-xs text-emerald-400/70">{ind.count} tracked</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 border-t border-gray-800/50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Secure Your Supply Chain?</h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Join producers, logistics partners, and vendors already using Veridion to build unbreakable trust.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup"
                            className="group px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-base font-semibold hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center gap-2">
                            Create Free Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/verify"
                            className="px-8 py-3.5 bg-gray-800/60 border border-gray-700 text-gray-200 rounded-xl text-base font-medium hover:bg-gray-800 transition-all">
                            Try Product Verification
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800/50 py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-bold text-gray-400">Veridion</span>
                        <span className="text-xs text-gray-600">— Trust the Origin. Track the Journey.</span>
                    </div>
                    <p className="text-xs text-gray-600">© 2025 Veridion. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
