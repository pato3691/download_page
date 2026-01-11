'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface SmtpConfig {
  id?: number;
  host: string;
  port: number;
  user: string;
  from_email: string;
  created_at?: string;
  updated_at?: string;
}

export default function SmtpSettings() {
  const [config, setConfig] = useState<SmtpConfig>({
    host: '',
    port: 587,
    user: '',
    from_email: '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/smtp-config');
      const data = await response.json();
      if (data.success && data.config) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading SMTP config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.host || !config.port || !config.user || !password || !config.from_email) {
      setMessage({ type: 'error', text: 'Prosím vyplňte všetky polia' });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/smtp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'SMTP nastavenia boli uložené' });
        setPassword('');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Chyba pri ukladaní' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Chyba pri ukladaní',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítavanie...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">SMTP Konfigurácia</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port
          </label>
          <input
            type="number"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Užívateľa
          </label>
          <input
            type="email"
            value={config.user}
            onChange={(e) => setConfig({ ...config, user: e.target.value })}
            placeholder="vase@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heslo
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Odosielateľa
          </label>
          <input
            type="email"
            value={config.from_email}
            onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
            placeholder="noreply@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'Ukladám...' : 'Uložiť'}
        </button>
      </div>
    </div>
  );
}
