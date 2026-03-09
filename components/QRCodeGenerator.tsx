'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { generateSimpleQRCodeData, encodeQRCodeData } from '@/services/qrcode';
import { generateQRCodeImage, downloadQRCodeImage, cleanupImageUrl } from '@/services/qrcode-api';
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface QRCodeGeneratorProps {
    batchId: string;
}

export function QRCodeGenerator({ batchId }: QRCodeGeneratorProps) {
    const [qrData, setQrData] = useState<string>('');
    const [qrImageUrl, setQrImageUrl] = useState<string>('');
    const [useApiImage, setUseApiImage] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [apiWarning, setApiWarning] = useState<string>('');

    useEffect(() => {
        generateQR();

        // Cleanup on unmount
        return () => {
            if (qrImageUrl) {
                cleanupImageUrl(qrImageUrl);
            }
        };
    }, [batchId]);

    const generateQR = async () => {
        setLoading(true);
        setError(null);
        setApiWarning('');

        try {
            // Generate QR code data without MetaMask signature
            const qrCodeData = generateSimpleQRCodeData(batchId);
            const encoded = encodeQRCodeData(qrCodeData);
            setQrData(encoded);

            // Try to generate QR code using API
            const apiResponse = await generateQRCodeImage({
                data: encoded,
                size: 512,
                format: 'png',
                errorCorrection: 'H',
            });

            if (apiResponse.success && apiResponse.imageUrl) {
                setQrImageUrl(apiResponse.imageUrl);
                setUseApiImage(true);
            } else {
                // Fallback to local generation
                setUseApiImage(false);
                setApiWarning(apiResponse.error || 'Using local QR generation');
                console.log('Falling back to local QR generation:', apiResponse.error);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate QR code');
            console.error('Failed to generate QR code:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (useApiImage && qrImageUrl) {
            // Download API-generated image
            downloadQRCodeImage(qrImageUrl, `${batchId}-qr.png`);
        } else {
            // Download SVG (fallback method)
            const canvas = document.getElementById(`qr-${batchId}`) as HTMLCanvasElement;
            if (!canvas) return;

            const svg = canvas.querySelector('svg');
            if (!svg) return;

            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);

            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `${batchId}-qr.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
        }
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(qrData);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-base">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
            {apiWarning && (
                <div className="w-full p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{apiWarning}</span>
                </div>
            )}

            <div id={`qr-${batchId}`} className="p-4 bg-white rounded-lg">
                {useApiImage && qrImageUrl ? (
                    <img
                        src={qrImageUrl}
                        alt="QR Code"
                        width={256}
                        height={256}
                        className="block"
                    />
                ) : (
                    <QRCodeSVG
                        value={qrData}
                        size={256}
                        level="H"
                        includeMargin={true}
                    />
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={downloadQR}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold"
                >
                    <Download className="w-4 h-4" />
                    Download QR
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy Data
                        </>
                    )}
                </button>
            </div>

            <div className="text-sm text-gray-400 text-center max-w-xs">
                This QR code contains batch information for verification.
                {useApiImage && <span className="block mt-1 text-green-400">✓ Generated via QRCodeAPI.io</span>}
            </div>
        </div>
    );
}
