import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Copy, Check, Download, Share2, Heart } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, proposalUrl, recipientName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('lovelink-qr-canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `LoveLink-${recipientName || 'proposal'}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-rose-100 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-gray-800 font-heading">
          Share with {recipientName || 'Your Special One'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          Scan the QR code or send the magic link directly!
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 inline-block shadow-inner mb-5">
          <QRCodeCanvas
            id="lovelink-qr-canvas"
            value={proposalUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f43f5e'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E",
              x: undefined,
              y: undefined,
              height: 28,
              width: 28,
              excavate: true,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Proposal Link'}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download QR Code Image</span>
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-center text-[11px] text-gray-400">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 mr-1" />
          <span>Made with love by LoveLink</span>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
