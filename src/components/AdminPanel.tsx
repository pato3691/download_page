'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  BarChart3,
  FileUp,
  Send,
  AlertCircle,
  Link2,
  Flag,
} from 'lucide-react';
import SmtpSettings from './admin/SmtpSettings';
import BulkEmailSender from './admin/BulkEmailSender';
import AdminStats from './admin/AdminStats';
import FileManager from './admin/FileManager';
import LinkGenerator from './admin/LinkGenerator';
import ReportManager from './admin/ReportManager';

type TabType = 'stats' | 'smtp' | 'bulk-email' | 'files' | 'links' | 'reports';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);

  useEffect(() => {
    // Kontrola hesla - jednoduché demo heslo
    const authPassword = localStorage.getItem('adminAuth');
    if (authPassword) {
      setAuthorized(true);
      setShowPasswordPrompt(false);
    }
  }, []);

  const handlePasswordSubmit = () => {
    // Demo heslo - zmeňte v produkcii!
    if (password === 'admin123') {
      setAuthorized(true);
      setShowPasswordPrompt(false);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Nesprávne heslo');
    }
  };

  if (showPasswordPrompt && !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-red-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">Administrácia</h2>
          </div>
          <p className="text-gray-600 mb-4">Zadajte administrátorské heslo:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            placeholder="Heslo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            Prihlásiť sa
          </button>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Štatistika', icon: <BarChart3 size={18} /> },
    { id: 'files', label: 'Súbory', icon: <FileUp size={18} /> },
    { id: 'links', label: 'Linky', icon: <Link2 size={18} /> },
    { id: 'smtp', label: 'SMTP', icon: <Settings size={18} /> },
    { id: 'bulk-email', label: 'Hromadný Email', icon: <Send size={18} /> },
    { id: 'reports', label: 'Nahlásenia', icon: <Flag size={18} /> },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-purple-100 mt-1">Správa systému stiahnutí a emailov</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'files' && <FileManager />}
          {activeTab === 'links' && <LinkGenerator />}
          {activeTab === 'smtp' && <SmtpSettings />}
          {activeTab === 'bulk-email' && <BulkEmailSender />}
          {activeTab === 'reports' && <ReportManager />}
        </div>
      </div>
    </div>
  );
}
