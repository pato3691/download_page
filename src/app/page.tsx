'use client';

import React, { useState, useEffect } from 'react';
import { Download, Upload, Settings } from 'lucide-react';
import DownloadModal from '@/components/DownloadModal';
import FileList from '@/components/FileList';

interface FileItem {
  id?: number;
  file_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  is_folder?: boolean;
  parent_folder_id?: string;
}

export default function Home() {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleDownloadClick = (file: FileItem) => {
    setSelectedFile(file);
    setShowDownloadModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download size={32} />
              <h1 className="text-3xl font-bold">Download & Upload</h1>
            </div>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Admin"
            >
              <Settings size={24} />
            </button>
          </div>
          <p className="text-purple-100 mt-2">
            Bezpečné stahovanie súborov s emailovou registráciou
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {showAdmin ? (
          <div>
            <button
              onClick={() => setShowAdmin(false)}
              className="mb-4 px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Späť na Download
            </button>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div style={{ minHeight: '600px' }}>
                <AdminPanel />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Files Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Download size={24} className="text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Dostupné súbory
                  </h2>
                </div>

                <FileList onDownload={handleDownloadClick} />
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ako to funguje?
                </h3>
                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      1️⃣ Výber súboru
                    </div>
                    <p>Vyberte súbor, ktorý chcete stiahnuť</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      2️⃣ Počkajte 60 sekúnd
                    </div>
                    <p>Odpočet vám zabezpečí čas na preskúmanie podmienok</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      3️⃣ Vyplňte email
                    </div>
                    <p>Zadajte svoju emailovú adresu pre potvrdenie</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      4️⃣ Súhlaste s podmienkami
                    </div>
                    <p>Potvrďte, že súhlasíte s podmienenkami</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      5️⃣ Stiahnuť
                    </div>
                    <p>Kliknite na tlačidlo Stiahnuť a súbor sa začne sťahovať</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
                <p className="text-sm text-blue-700">
                  ℹ️ <strong>Úspešne stažený súbor?</strong> Potvrdzovací email
                  bude odoslaný na vašu adresu.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Modal */}
      {selectedFile && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => {
            setShowDownloadModal(false);
            setSelectedFile(null);
          }}
          fileName={selectedFile.file_name}
          filePath={selectedFile.file_path}
        />
      )}
    </div>
  );
}

import AdminPanel from '@/components/AdminPanel';
