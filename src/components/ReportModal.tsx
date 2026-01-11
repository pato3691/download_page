'use client';

import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadToken: string;
  fileName: string;
}

export default function ReportModal({ isOpen, onClose, downloadToken, fileName }: ReportModalProps) {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !reason) {
      alert('Vyplň všetky povinné polia!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/file-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          download_token: downloadToken,
          file_name: fileName,
          reporter_email: email,
          reason,
          description: description || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setEmail('');
          setReason('');
          setDescription('');
          setSubmitted(false);
        }, 2000);
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba pri nahlasovaní');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-800">Nahlásiť Súbor</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flag className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-gray-800 font-medium">Ďakujeme za nahlásenie!</p>
            <p className="text-sm text-gray-600 mt-2">Overíme to čo najskôr.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tvoj Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvoj@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dôvod Nahlásenia *
              </label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">- Vyber dôvod -</option>
                <option value="virus_malware">Nebezpečný obsah / Malware</option>
                <option value="spam">Spam</option>
                <option value="copyright">Porušenie autorských práv</option>
                <option value="illegal">Ilegálny obsah</option>
                <option value="other">Iné</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ďalšie Detaily
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Napíš nám viac detailov..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Zrušiť
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Odosielam...' : 'Nahlásiť'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
