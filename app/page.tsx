'use client';

import Link from 'next/link';
import { Shield, Factory, TruckIcon, Building2, User, ArrowRight, Building, Lock, Zap, Globe, CheckCircle2, AlertTriangle, BarChart3, FileCheck, Smartphone } from 'lucide-react';
import BackgroundScene from '@/components/BackgroundScene';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 relative overflow-hidden">
            {/* Background Animation */}
            <BackgroundScene />

            {/* Landing Page Header */}
            <header className="absolute top-0 left-0 right-0 z-20 px-4 py-6">
                <div className="container mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo.png" alt="MediChain Logo" className="w-10 h-10 transition-transform group-hover:scale-110" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            MediChain
                        </h1>
                    </Link>

                    {/* Sign Up Button */}
                    <Link
                        href="/signup"
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-xl hover:shadow-green-500/50 transition-all hover:scale-105 font-semibold"
                    >
                        Sign Up
                    </Link>
                </div>
            </header>

            {/* Content with relative positioning to appear above background */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-5xl mx-auto text-center animate-fade-in">
                        <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                            🔒 Powered by Blockchain Technology
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
                            Tamper-Proof Medicine Supply Chain
                        </h2>
                        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Blockchain-powered verification platform preventing counterfeit medicines.
                            Every batch is tracked from manufacturer to customer with cryptographic proof.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-105 font-semibold flex items-center justify-center gap-2"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-gray-800/50 border-2 border-green-500/50 text-green-400 rounded-lg hover:bg-gray-800 transition-all font-semibold backdrop-blur-sm"
                            >
                                Learn How It Works
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span>100% Transparent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-500" />
                                <span>Cryptographically Secure</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span>Real-time Tracking</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center card-hover border border-red-500/30">
                            <div className="text-4xl font-bold text-red-400 mb-2">$200B</div>
                            <div className="text-gray-400">Annual counterfeit medicine market</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center card-hover border border-orange-500/30">
                            <div className="text-4xl font-bold text-orange-400 mb-2">10-30%</div>
                            <div className="text-gray-400">Medicines in developing countries are fake</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center card-hover border border-purple-500/30">
                            <div className="text-4xl font-bold text-purple-400 mb-2">1M+</div>
                            <div className="text-gray-400">Deaths annually from fake medicines</div>
                        </div>
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center card-hover border border-green-500/30">
                            <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                            <div className="text-gray-400">Traceability with blockchain</div>
                        </div>
                    </div>
                </section>

                {/* Problem Statement */}
                <section className="container mx-auto px-4 section-spacing bg-gradient-to-r from-red-950/50 to-orange-950/50 rounded-3xl my-12 backdrop-blur-sm border border-red-500/20">
                    <div className="max-w-4xl mx-auto text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-100">The Counterfeit Medicine Crisis</h3>
                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                            Counterfeit medicines are a global epidemic, causing over <strong className="text-red-400">1 million deaths annually</strong>.
                            Traditional supply chains lack transparency, making it impossible to verify medicine authenticity.
                            Patients unknowingly consume fake drugs, leading to treatment failures, drug resistance, and fatalities.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-red-500/30">
                                <div className="text-3xl font-bold text-red-400 mb-2">42%</div>
                                <p className="text-gray-400">Of antimalarial drugs in Africa are counterfeit</p>
                            </div>
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-orange-500/30">
                                <div className="text-3xl font-bold text-orange-400 mb-2">$4.4B</div>
                                <p className="text-gray-400">Lost revenue for pharmaceutical companies</p>
                            </div>
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-500/30">
                                <div className="text-3xl font-bold text-purple-400 mb-2">70%</div>
                                <p className="text-gray-400">Of online pharmacies are illegal</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="container mx-auto px-4 section-spacing">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">How MediChain Works</h3>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Our blockchain-powered platform creates an immutable record of every medicine batch from production to patient
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg card-hover relative border border-blue-500/30">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                1
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 mt-4">
                                <Factory className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-100">Manufacturer Creates</h4>
                            <p className="text-gray-400">
                                Manufacturer creates a batch on blockchain with unique ID and generates a cryptographic QR code
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg card-hover relative border border-yellow-500/30">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                2
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 mt-4">
                                <TruckIcon className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-100">Supply Chain Transfer</h4>
                            <p className="text-gray-400">
                                Distributors transfer ownership on blockchain, creating an immutable audit trail
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg card-hover relative border border-green-500/30">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                3
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4 mt-4">
                                <Building2 className="w-6 h-6 text-green-400" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-100">Pharmacy Receives</h4>
                            <p className="text-gray-400">
                                Pharmacy receives and confirms delivery, updating the blockchain record
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg card-hover relative border border-purple-500/30">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                4
                            </div>
                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mt-4">
                                <User className="w-6 h-6 text-purple-400" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-100">Customer Verifies</h4>
                            <p className="text-gray-400">
                                Customer scans QR code to instantly verify authenticity and view complete history
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/how-it-works" className="text-blue-400 font-semibold hover:underline flex items-center justify-center gap-2">
                            Learn more about our process <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* Key Features */}
                <section className="container mx-auto px-4 section-spacing bg-gradient-to-br from-blue-950/30 to-purple-950/30 rounded-3xl my-12 backdrop-blur-sm border border-blue-500/20">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">Powerful Features</h3>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Built with cutting-edge blockchain technology to ensure maximum security and transparency
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-blue-500/30">
                            <Lock className="w-12 h-12 text-blue-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">Tamper-Proof Records</h4>
                            <p className="text-gray-400">
                                Blockchain ensures all records are immutable and cannot be altered or deleted
                            </p>
                        </div>
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-green-500/30">
                            <Smartphone className="w-12 h-12 text-green-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">QR Code Verification</h4>
                            <p className="text-gray-400">
                                Instant verification via smartphone - scan and verify in seconds
                            </p>
                        </div>
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-purple-500/30">
                            <Globe className="w-12 h-12 text-purple-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">Global Accessibility</h4>
                            <p className="text-gray-400">
                                Access from anywhere in the world with internet connection
                            </p>
                        </div>
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-orange-500/30">
                            <BarChart3 className="w-12 h-12 text-orange-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">Real-time Analytics</h4>
                            <p className="text-gray-400">
                                Track supply chain metrics and detect anomalies instantly
                            </p>
                        </div>
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-teal-500/30">
                            <FileCheck className="w-12 h-12 text-teal-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">Compliance Ready</h4>
                            <p className="text-gray-400">
                                Meet regulatory requirements with automated audit trails
                            </p>
                        </div>
                        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border border-yellow-500/30">
                            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                            <h4 className="text-xl font-semibold mb-3 text-gray-100">Lightning Fast</h4>
                            <p className="text-gray-400">
                                Optimized smart contracts for quick verification and transfers
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <Link href="/features" className="text-blue-400 font-semibold hover:underline flex items-center justify-center gap-2">
                            Explore all features <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>

                {/* Benefits by Stakeholder */}
                <section className="container mx-auto px-4 section-spacing">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">Benefits for Everyone</h3>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            MediChain creates value across the entire pharmaceutical supply chain
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-xl shadow-xl text-white border border-blue-400/30">
                            <Factory className="w-12 h-12 mb-4" />
                            <h4 className="text-2xl font-bold mb-4">For Manufacturers</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Protect brand reputation from counterfeits</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Gain real-time supply chain visibility</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Reduce recall costs with precise tracking</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-xl shadow-xl text-white border border-green-400/30">
                            <Building2 className="w-12 h-12 mb-4" />
                            <h4 className="text-2xl font-bold mb-4">For Pharmacies</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Verify medicine authenticity before selling</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Build customer trust and loyalty</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Streamline inventory management</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-8 rounded-xl shadow-xl text-white border border-purple-400/30">
                            <User className="w-12 h-12 mb-4" />
                            <h4 className="text-2xl font-bold mb-4">For Patients</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Instant verification via smartphone</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Complete transparency of medicine journey</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Peace of mind with every purchase</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-xl shadow-xl text-white border border-orange-400/30">
                            <Building className="w-12 h-12 mb-4" />
                            <h4 className="text-2xl font-bold mb-4">For Regulators</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Real-time monitoring of supply chain</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Automated compliance reporting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 mt-1 flex-shrink-0" />
                                    <span>Rapid identification of counterfeit sources</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Technology Stack */}
                <section className="container mx-auto px-4 section-spacing bg-gradient-to-r from-gray-900 to-blue-950 rounded-3xl my-12 text-white border border-blue-500/30">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4">Built on Cutting-Edge Technology</h3>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Leveraging the most advanced blockchain and web technologies
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center card-hover border border-blue-500/30">
                            <div className="text-3xl font-bold mb-2">⟠</div>
                            <div className="font-semibold">Ethereum</div>
                            <div className="text-sm text-gray-400">Blockchain</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center card-hover border border-purple-500/30">
                            <div className="text-3xl font-bold mb-2">◈</div>
                            <div className="font-semibold">Solidity</div>
                            <div className="text-sm text-gray-400">Smart Contracts</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center card-hover border border-blue-500/30">
                            <div className="text-3xl font-bold mb-2">▲</div>
                            <div className="font-semibold">Next.js</div>
                            <div className="text-sm text-gray-400">Frontend</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-center card-hover border border-purple-500/30">
                            <div className="text-3xl font-bold mb-2">⬢</div>
                            <div className="font-semibold">Hardhat</div>
                            <div className="text-sm text-gray-400">Development</div>
                        </div>
                    </div>
                </section>

                {/* Portals */}
                <section className="container mx-auto px-4 section-spacing">
                    <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-100">Access Portals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <Link href="/login" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-green-500">
                                <Factory className="w-12 h-12 text-green-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Manufacturer Portal</h4>
                                <p className="text-gray-400 mb-4">Create batches and generate QR codes</p>
                                <div className="text-green-400 font-semibold flex items-center gap-2">
                                    Access Portal <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/login" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-yellow-500">
                                <TruckIcon className="w-12 h-12 text-yellow-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Distributor Portal</h4>
                                <p className="text-gray-400 mb-4">Transfer batches in supply chain</p>
                                <div className="text-yellow-400 font-semibold flex items-center gap-2">
                                    Access Portal <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/login" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-green-500">
                                <Building2 className="w-12 h-12 text-green-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Pharmacy Portal</h4>
                                <p className="text-gray-400 mb-4">Receive and manage inventory</p>
                                <div className="text-green-400 font-semibold flex items-center gap-2">
                                    Access Portal <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/hospital/bulk-verify" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-purple-500">
                                <Building className="w-12 h-12 text-purple-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Hospital Portal</h4>
                                <p className="text-gray-400 mb-4">Bulk verify medicines via CSV</p>
                                <div className="text-purple-400 font-semibold flex items-center gap-2">
                                    Access Portal <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/login" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-pink-500">
                                <User className="w-12 h-12 text-pink-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Customer Verification</h4>
                                <p className="text-gray-400 mb-4">Scan QR code to verify medicine</p>
                                <div className="text-pink-400 font-semibold flex items-center gap-2">
                                    Verify Now <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/login" className="group">
                            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg card-hover border-2 border-transparent group-hover:border-red-500">
                                <Shield className="w-12 h-12 text-red-400 mb-4" />
                                <h4 className="text-xl font-semibold mb-2 text-gray-100">Admin Dashboard</h4>
                                <p className="text-gray-400 mb-4">Analytics and fraud detection</p>
                                <div className="text-red-400 font-semibold flex items-center gap-2">
                                    Access Dashboard <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="container mx-auto px-4 section-spacing bg-gradient-to-br from-purple-950/30 to-pink-950/30 rounded-3xl my-12 backdrop-blur-sm border border-purple-500/20">
                    <div className="max-w-3xl mx-auto">
                        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-100">Frequently Asked Questions</h3>
                        <div className="space-y-6">
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-500/30">
                                <h4 className="text-lg font-semibold mb-2 text-gray-100">How does blockchain prevent counterfeit medicines?</h4>
                                <p className="text-gray-400">
                                    Blockchain creates an immutable record of each medicine batch. Every transaction is cryptographically signed and cannot be altered, making it impossible to introduce fake medicines into the verified supply chain.
                                </p>
                            </div>
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-500/30">
                                <h4 className="text-lg font-semibold mb-2 text-gray-100">Is the verification process free for customers?</h4>
                                <p className="text-gray-400">
                                    Yes! Customers can verify medicines completely free by scanning the QR code with any smartphone. No app installation or registration required.
                                </p>
                            </div>
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-500/30">
                                <h4 className="text-lg font-semibold mb-2 text-gray-100">What information is stored on the blockchain?</h4>
                                <p className="text-gray-400">
                                    We store batch ID, manufacturing date, expiry date, transfer history, and cryptographic hashes. Personal patient information is never stored on the blockchain.
                                </p>
                            </div>
                            <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-purple-500/30">
                                <h4 className="text-lg font-semibold mb-2 text-gray-100">How can my company integrate with MediChain?</h4>
                                <p className="text-gray-400">
                                    We provide easy-to-use portals for manufacturers, distributors, and pharmacies. Simply connect your wallet and start creating or transferring batches. Contact us for enterprise integration support.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl border border-blue-400/30">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure Your Supply Chain?</h3>
                        <p className="text-xl mb-8 text-blue-100">
                            Join the fight against counterfeit medicines with blockchain technology
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-8 py-4 bg-white text-green-600 rounded-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="/login"
                                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm mt-20">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                    <h3 className="text-xl font-bold text-gray-100">MediChain</h3>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Securing the pharmaceutical supply chain with blockchain technology.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4 text-gray-100">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/about" className="text-gray-400 hover:text-blue-400">About Us</Link></li>
                                    <li><Link href="/how-it-works" className="text-gray-400 hover:text-blue-400">How It Works</Link></li>
                                    <li><Link href="/features" className="text-gray-400 hover:text-blue-400">Features</Link></li>
                                    <li><Link href="/contact" className="text-gray-400 hover:text-blue-400">Contact</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4 text-gray-100">Portals</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/manufacturer" className="text-gray-400 hover:text-blue-400">Manufacturer</Link></li>
                                    <li><Link href="/distributor" className="text-gray-400 hover:text-blue-400">Distributor</Link></li>
                                    <li><Link href="/pharmacy" className="text-gray-400 hover:text-blue-400">Pharmacy</Link></li>
                                    <li><Link href="/verify" className="text-gray-400 hover:text-blue-400">Verify Medicine</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4 text-gray-100">Connect</h4>
                                <p className="text-gray-400 text-sm mb-2">support@medichain.com</p>
                                <p className="text-gray-400 text-sm">© 2024 MediChain</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                            <p>Built with blockchain technology to prevent counterfeit medicines. Powered by Ethereum & Next.js</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
