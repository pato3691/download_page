'use client';

import React, { useState, useEffect } from 'react';
import { Download, Flag } from 'lucide-react';
import ReportModal from './ReportModal';

interface DownloadLink {
  token: string;
  file_name: string;
  description?: string;
  original_file_name: string;
  download_count?: number;
}

export default function PublicDownloads() {
  const [links, setLinks] = useState<DownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    token: '',
    fileName: ''
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const response = await fetch('/api/admin/download-links');
      const data = await response.json();
      if (data.success) {
        setLinks(data.links);
      }
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Načítavam...</div>;
  }

  if (links.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
        <Download className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Žiadne dostupné súbory na stiahnutie</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dostupné Súbory na Stiahnutie</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <div
            key={link.token}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex-1">
                {link.original_file_name || link.file_name}
              </h3>
              <button
                onClick={() =>
                  setReportModal({
                    isOpen: true,
                    token: link.token,
                    fileName: link.file_name
                  })
                }
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                title="Nahlásiť nevhodný obsah"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {link.description && (
              <p className="text-gray-600 text-sm mb-3">{link.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Stiahnuté: {link.download_count || 0}x
              </span>
              <a
                href={`/d/${link.token}`}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Stiahnuť
              </a>
            </div>
          </div>
        ))}
      </div>

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        downloadToken={reportModal.token}
        fileName={reportModal.fileName}
      />
    </div>
  );
}
