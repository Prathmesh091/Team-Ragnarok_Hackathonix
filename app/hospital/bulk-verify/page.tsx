'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScanLine, Upload, Download, FileText, Shield, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import Papa from 'papaparse';

interface VerificationResult {
    batchId: string;
    status: 'genuine' | 'suspicious' | 'counterfeit' | 'not_found' | 'expired';
    reason: string;
}

export default function HospitalBulkVerifyPage() {
    const [results, setResults] = useState<VerificationResult[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProcessing(true); setError(null); setResults([]);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/verify/bulk', { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to verify batches');
            setResults(data.results);
        } catch (err: any) {
            setError(err.message || 'Failed to process file');
        } finally { setProcessing(false); }
    };

    const downloadResults = () => {
        const csv = Papa.unparse(results);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `verification-results-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const stats = {
        total: results.length,
        genuine: results.filter(r => r.status === 'genuine').length,
        suspicious: results.filter(r => r.status === 'suspicious').length,
        expired: results.filter(r => r.status === 'expired').length,
        counterfeit: results.filter(r => r.status === 'counterfeit' || r.status === 'not_found').length,
    };

    return (
        <DashboardShell>
            <PageHeader title="Bulk Verification" description="Upload CSV file to verify multiple medicine batches at once" icon={ScanLine} />

            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Upload className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-semibold text-gray-200">Upload CSV File</h2>
                </div>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <label className="cursor-pointer">
                        <span className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all inline-block">
                            Choose CSV File
                        </span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={processing} />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">CSV should have a column named "batchId"</p>
                </div>

                {processing && (
                    <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-3"></div>
                        <p className="text-sm text-gray-400">Processing batches...</p>
                    </div>
                )}
                {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        <MetricCard icon={Package} label="Total" value={stats.total} color="blue" />
                        <MetricCard icon={CheckCircle} label="Genuine" value={stats.genuine} color="emerald" />
                        <MetricCard icon={AlertTriangle} label="Suspicious" value={stats.suspicious} color="amber" />
                        <MetricCard icon={Shield} label="Expired" value={stats.expired} color="purple" />
                        <MetricCard icon={Shield} label="Counterfeit" value={stats.counterfeit} color="red" />
                    </div>

                    {/* Download */}
                    <div className="mb-4">
                        <button onClick={downloadResults}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download Results
                        </button>
                    </div>

                    {/* Results Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                                        <th className="text-left px-6 py-3 font-medium">Batch ID</th>
                                        <th className="text-left px-6 py-3 font-medium">Status</th>
                                        <th className="text-left px-6 py-3 font-medium">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/20">
                                    {results.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-3.5 text-sm font-mono text-gray-200">{result.batchId}</td>
                                            <td className="px-6 py-3.5"><StatusBadge status={result.status} /></td>
                                            <td className="px-6 py-3.5 text-sm text-gray-400">{result.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </DashboardShell>
    );
}
