'use client';

import React, { useState, useEffect } from 'react';
import { Link2, Trash2, Eye, EyeOff } from 'lucide-react';

interface DownloadLink {
  id?: number;
  token: string;
  file_name: string;
  description?: string;
  is_active?: boolean;
  download_count?: number;
  created_at?: string;
}

export default function LinkGenerator() {
  const [files, setFiles] = useState<any[]>([]);
  const [links, setLinks] = useState<DownloadLink[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedFile) {
      alert('Vyber súbor!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/download-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: selectedFile,
          original_file_name: files.find(f => f.file_id === selectedFile)?.file_name,
          description: description || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setDescription('');
        setSelectedFile('');
        loadLinks();
        alert('Link bol vytvorený!');
      } else {
        alert('Chyba: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Chyba pri vytváraní linku');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (token: string) => {
    if (!confirm('Zmazať link?')) return;

    try {
      const response = await fetch('/api/admin/download-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (data.success) {
        loadLinks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/d/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link skopírovaný!');
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">Generovať Download Linky</h3>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vyber súbor
          </label>
          <input
            type="text"
            placeholder="Zadaj súbor ID..."
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Zobrazí sa po nahrení súboru</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popis (voliteľný)
          </label>
          <textarea
            placeholder="Napíš čo tento súbor obsahuje..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Generujem...' : 'Generovať Link'}
        </button>
      </div>

      {/* Links List */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Dostupné Linky</h3>
        {links.length === 0 ? (
          <p className="text-gray-500">Žiadne linky zatiaľ</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.token} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{link.file_name}</p>
                    {link.description && (
                      <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Stiahnuté: {link.download_count || 0}x
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(link.token)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Kopíruj link"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.token)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Zmaž link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 break-all">
                  /d/{link.token}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
