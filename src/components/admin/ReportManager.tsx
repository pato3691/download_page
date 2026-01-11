'use client';

import React, { useState, useEffect } from 'react';
import { Flag, Check, Trash2, AlertCircle } from 'lucide-react';

interface FileReport {
  id: number;
  download_token: string;
  file_name: string;
  reporter_email: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function ReportManager() {
  const [reports, setReports] = useState<FileReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FileReport | null>(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/admin/file-reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number, status: string) => {
    if (!reportId || !status) return;

    try {
      const response = await fetch('/api/admin/file-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status,
          notes: notes || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedReport(null);
        setNotes('');
        setAction('');
        loadReports();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const reasonLabels: Record<string, string> = {
    'virus_malware': '🦠 Nebezpečný obsah / Malware',
    'spam': '📧 Spam',
    'copyright': '©️ Porušenie autorských práv',
    'illegal': '⚖️ Ilegálny obsah',
    'other': '❓ Iné'
  };

  if (loading) {
    return <div className="text-center text-gray-500">Načítavam...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 text-center">
        <Flag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Žiadne nahlásenia na overenie</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Nahlásené Súbory ({reports.length})
      </h3>

      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{report.file_name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  📌 {reasonLabels[report.reason] || report.reason}
                </p>
                {report.description && (
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    {report.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Od: {report.reporter_email} • {new Date(report.created_at).toLocaleDateString('sk')}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(report)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                Spracovať
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Spracovať Nahlásenie</h3>

            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-800">
                <strong>{selectedReport.file_name}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {reasonLabels[selectedReport.reason]}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Akcia
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">- Vyber akciu -</option>
                <option value="resolved">✓ Vyriešené</option>
                <option value="dismissed">✕ Zamietnuté</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poznámky
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tvoj komentár..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setNotes('');
                  setAction('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Zrušiť
              </button>
              <button
                onClick={() => handleResolve(selectedReport.id, action)}
                disabled={!action}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                Uložiť
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
