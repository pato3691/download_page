'use client';

import React, { useState, useEffect } from 'react';
import { Download, Download as DownloadIcon, Clock, Mail } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  filePath: string;
}

export default function DownloadModal({
  isOpen,
  onClose,
  fileName,
  filePath,
}: DownloadModalProps) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(60);
      setEmail('');
      setAgreed(false);
      setError('');
      setSuccess(false);
      return;
    }

    let timer: NodeJS.Timeout;
    if (countdown > 0 && !agreed) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isOpen, agreed, countdown]);

  const handleDownload = async () => {
    if (!email || !agreed) {
      setError('Prosím vyplňte email a súhlaste s podmienkami');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Prosím zadajte platný email');
      return;
    }

    setDownloading(true);
    setError('');

    try {
      // Registrácia downloadu
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fileName,
          filePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Chyba pri registrácii downloadu');
      }

      // Vlastný download
      const downloadLink = document.createElement('a');
      downloadLink.href = `/uploads/${filePath}`;
      downloadLink.download = fileName;
      downloadLink.click();

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba pri downloade');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-2">
            <DownloadIcon size={24} />
            <h2 className="text-xl font-bold">Stiahnutie súboru</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <p className="text-green-600 font-semibold">
                Súbor sa začína sťahovať!
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Potvrdzovací email bol odoslaný na: <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-700 text-sm">
                  <strong>Súbor:</strong> {fileName}
                </p>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    Emailová adresa
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Countdown */}
              {!agreed && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock size={16} />
                    <span className="text-sm font-medium">
                      Počkajte {countdown} sekúnd...
                    </span>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    disabled={countdown > 0}
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Súhlasím s podmienkami stiahnutia a spracovaním mojej
                    emailovej adresy
                  </span>
                </label>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!agreed || downloading || countdown > 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Stahujem...
                    </>
                  ) : (
                    <>
                      <DownloadIcon size={18} />
                      Stiahnuť
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
