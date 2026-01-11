'use client';

import React, { useState } from 'react';
import { Download, Settings } from 'lucide-react';
import PublicDownloads from '@/components/PublicDownloads';
import AdminPanel from '@/components/AdminPanel';

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download size={32} />
              <h1 className="text-3xl font-bold">Download Hub</h1>
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
            Bezpečné a jednoduché sťahovanie súborov
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
                <PublicDownloads />
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
                      1️⃣ Vyberte súbor
                    </div>
                    <p>Kliknite na súbor, ktorý chcete stiahnuť</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      2️⃣ Zadajte email
                    </div>
                    <p>Váš email budeme potrebovať na potvrdenie</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      3️⃣ Súhlas s podmienenkami
                    </div>
                    <p>Potvrďte, že súhlasíte s podmienkami stahovania</p>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-600 mb-1">
                      4️⃣ Stiahnuť
                    </div>
                    <p>Kliknite na Stiahnuť a súbor sa začne sťahovať</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
                <p className="text-sm text-blue-700">
                  🔒 Všetky údaje sú chránené a nikdy sa nepredávajú tretím stranám.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-md p-6 border border-amber-200">
                <p className="text-sm text-amber-700">
                  ⚠️ Našli ste nebezpečný súbor? Nájdete možnosť nahlásenia pod každým súborom.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
