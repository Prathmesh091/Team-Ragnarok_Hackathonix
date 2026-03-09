'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface QRCodeGeneratorProps {
    batchId: string;
    productName?: string;
    manufacturer?: string;
    category?: string;
    sku?: string;
    origin?: string;
}

export function QRCodeGenerator({ batchId, productName, manufacturer, category, sku, origin }: QRCodeGeneratorProps) {
    const [copied, setCopied] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    // Build a human-readable verification URL/data string
    const verificationUrl = `https://medisecure.app/verify/${batchId}`;

    // The QR code encodes a structured verification payload
    const qrPayload = JSON.stringify({
        v: 1, // version
        id: batchId,
        product: productName || 'N/A',
        mfg: manufacturer || 'N/A',
        cat: category || 'N/A',
        sku: sku || 'N/A',
        origin: origin || 'N/A',
        ts: new Date().toISOString().split('T')[0],
        url: verificationUrl,
    });

    const downloadQR = () => {
        const svgEl = qrRef.current?.querySelector('svg');
        if (!svgEl) return;

        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, 512, 512);
                ctx.drawImage(img, 0, 0, 512, 512);
                const pngUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = `${batchId}-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handleCopy = async () => {
        const success = await copyToClipboard(verificationUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700">
            <div ref={qrRef} className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                    value={qrPayload}
                    size={256}
                    level="H"
                    includeMargin={true}
                />
            </div>

            {/* Product details shown below QR */}
            <div className="w-full space-y-1.5 text-xs text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <div className="flex justify-between"><span className="text-gray-500">Batch ID</span><span className="font-mono text-emerald-400">{batchId}</span></div>
                {productName && <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="text-gray-200">{productName}</span></div>}
                {manufacturer && <div className="flex justify-between"><span className="text-gray-500">Manufacturer</span><span className="text-gray-300">{manufacturer}</span></div>}
                {category && <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-gray-300">{category}</span></div>}
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
                            Copy Link
                        </>
                    )}
                </button>
            </div>

            <div className="text-sm text-gray-400 text-center max-w-xs">
                Scan to verify product authenticity.
                <span className="block mt-1 text-green-400">✓ QR Code Generated</span>
            </div>
        </div>
    );
}
