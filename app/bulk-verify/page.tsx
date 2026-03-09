'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScanLine, Upload, Download, FileText, Shield, CheckCircle, AlertTriangle, Package, XCircle, Clock, Info } from 'lucide-react';
import Papa from 'papaparse';

interface VerificationResult {
    batchId: string;
    status: 'genuine' | 'suspicious' | 'counterfeit' | 'not_found' | 'expired' | 'error';
    reason: string;
    trustScore?: number;
    productName?: string;
    expiryDate?: string | null;
    manufacturer?: string;
}

export default function BulkVerifyPage() {
    const [results, setResults] = useState<VerificationResult[]>([]);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProcessing(true);
        setError(null);
        setResults([]);
        setFileName(file.name);
        setProgress(10);

        try {
            // Parse CSV on client side first to show progress
            const text = await file.text();
            setProgress(30);

            const parsed = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header: string) => header.trim(),
            });

            if (parsed.errors.length > 0 && parsed.data.length === 0) {
                throw new Error('Invalid CSV format. Make sure the file has headers and data rows.');
            }

            // Try to find batch ID column (flexible matching)
            const sampleRow = parsed.data[0] as Record<string, any>;
            const headers = Object.keys(sampleRow);
            const batchIdCol = headers.find(h =>
                ['batchid', 'batch_id', 'batchId', 'BatchID', 'BATCH_ID', 'id', 'ID', 'batch'].includes(h.trim())
            );

            if (!batchIdCol) {
                throw new Error(
                    `Could not find a batch ID column. Found columns: [${headers.join(', ')}]. ` +
                    `Expected one of: batchId, batch_id, BatchID, id`
                );
            }

            const batchIds = (parsed.data as Record<string, any>[])
                .map(row => row[batchIdCol]?.toString().trim())
                .filter(Boolean);

            if (batchIds.length === 0) {
                throw new Error('CSV file contains no batch IDs. Please check the file content.');
            }

            setProgress(50);

            // Send to API
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/verify/bulk', {
                method: 'POST',
                body: formData,
            });

            setProgress(80);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify batches');
            }

            setResults(data.results || []);
            setProgress(100);

        } catch (err: any) {
            setError(err.message || 'Failed to process file');
        } finally {
            setProcessing(false);
            // Reset file input so the same file can be re-uploaded
            e.target.value = '';
        }
    };

    const downloadResults = () => {
        const csvData = results.map(r => ({
            'Batch ID': r.batchId,
            'Status': r.status.toUpperCase(),
            'Trust Score': r.trustScore || 0,
            'Product Name': r.productName || 'N/A',
            'Manufacturer': r.manufacturer || 'N/A',
            'Expiry Date': r.expiryDate || 'N/A',
            'Details': r.reason,
        }));
        const csv = Papa.unparse(csvData);
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

    const downloadSampleCSV = () => {
        const sampleData = [
            { batchId: 'BAT-ELEC-001' },
            { batchId: 'BAT-PHAR-001' },
            { batchId: 'BAT-FOOD-001' },
            { batchId: 'BAT-LUX-001' },
            { batchId: 'BAT-AUTO-001' },
            { batchId: 'BAT-FOOD-004-SUS' },
            { batchId: 'BAT-UNKNOWN-999' },
        ];
        const csv = Papa.unparse(sampleData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample-batch-ids.csv';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'genuine': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'suspicious': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            case 'expired': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
            case 'counterfeit': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'not_found': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'genuine': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'suspicious': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            case 'expired': return <Clock className="w-4 h-4 text-purple-400" />;
            case 'counterfeit': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'not_found': return <Info className="w-4 h-4 text-gray-400" />;
            default: return <Info className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <DashboardShell>
            <PageHeader title="Bulk Verification" description="Upload a CSV file containing batch IDs to verify multiple products at once" icon={ScanLine} />

            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-purple-400" />
                        <h2 className="text-base font-semibold text-gray-200">Upload CSV File</h2>
                    </div>
                    <button onClick={downloadSampleCSV}
                        className="px-3 py-1.5 bg-gray-700/50 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" /> Download Sample CSV
                    </button>
                </div>

                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
                    <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <label className="cursor-pointer">
                        <span className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all inline-block">
                            Choose CSV File
                        </span>
                        <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" disabled={processing} />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">
                        CSV should have a column named <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-purple-300">batchId</code> or <code className="bg-gray-700/50 px-1.5 py-0.5 rounded text-purple-300">batch_id</code>
                    </p>
                    {fileName && !processing && (
                        <p className="text-xs text-emerald-400 mt-2">✓ Processed: {fileName}</p>
                    )}
                </div>

                {/* Progress Bar */}
                {processing && (
                    <div className="mt-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                            <p className="text-sm text-gray-400">
                                {progress < 50 ? 'Parsing CSV file...' : progress < 80 ? 'Verifying batches against blockchain...' : 'Compiling results...'}
                            </p>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 text-sm font-medium">Verification Error</p>
                            <p className="text-red-400/70 text-xs mt-1">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        <MetricCard icon={Package} label="Total Scanned" value={stats.total} color="blue" />
                        <MetricCard icon={CheckCircle} label="Genuine" value={stats.genuine} color="emerald" />
                        <MetricCard icon={AlertTriangle} label="Suspicious" value={stats.suspicious} color="amber" />
                        <MetricCard icon={Clock} label="Expired" value={stats.expired} color="purple" />
                        <MetricCard icon={Shield} label="Counterfeit" value={stats.counterfeit} color="red" />
                    </div>

                    {/* Download + summary */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-400">
                                <span className="text-emerald-400 font-semibold">{Math.round((stats.genuine / stats.total) * 100)}%</span> genuine rate across {stats.total} batches
                            </p>
                        </div>
                        <button onClick={downloadResults}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export Results CSV
                        </button>
                    </div>

                    {/* Results Table */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-700/30 bg-gray-800/30">
                                        <th className="text-left px-6 py-3.5 font-medium w-8">#</th>
                                        <th className="text-left px-6 py-3.5 font-medium">Batch ID</th>
                                        <th className="text-left px-6 py-3.5 font-medium hidden md:table-cell">Product</th>
                                        <th className="text-left px-6 py-3.5 font-medium">Status</th>
                                        <th className="text-left px-6 py-3.5 font-medium hidden sm:table-cell">Trust Score</th>
                                        <th className="text-left px-6 py-3.5 font-medium">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/20">
                                    {results.map((result, index) => (
                                        <tr key={index} className="hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-3.5 text-xs text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-3.5 text-sm font-mono text-emerald-400">{result.batchId}</td>
                                            <td className="px-6 py-3.5 text-sm text-gray-300 hidden md:table-cell">{result.productName || '—'}</td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(result.status)}`}>
                                                    {getStatusIcon(result.status)}
                                                    {result.status === 'not_found' ? 'NOT FOUND' : result.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 hidden sm:table-cell">
                                                {result.trustScore !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-700/50 rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full ${result.trustScore >= 80 ? 'bg-emerald-500' : result.trustScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                style={{ width: `${result.trustScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-mono">{result.trustScore}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 text-xs text-gray-400 max-w-[250px] truncate">{result.reason}</td>
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
