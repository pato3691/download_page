'use client';

import React, { useState } from 'react';
import { Send, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function BulkEmailSender() {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    type: 'success' | 'error';
    text: string;
    stats?: { successCount: number; failedCount: number; totalCount: number };
  } | null>(null);

  const handleSend = async () => {
    const emails = recipients
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emails.length === 0 || !subject || !message) {
      setResponse({
        type: 'error',
        text: 'Prosím vyplňte všetky polia a minimálne jednu emailovú adresu',
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/admin/send-bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emails,
          subject,
          message,
        }),
      });

      const data = await res.json();
      setResponse({
        type: data.success ? 'success' : 'error',
        text: data.message,
        stats: data.stats,
      });

      if (data.success) {
        setRecipients('');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      setResponse({
        type: 'error',
        text: error instanceof Error ? error.message : 'Chyba pri odosielaní',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Hromadné odosielanie emailov
      </h2>

      {response && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            response.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-start gap-3">
            {response.type === 'success' ? (
              <CheckCircle size={20} className="mt-1 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-1 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{response.text}</p>
              {response.stats && (
                <div className="mt-2 text-sm space-y-1">
                  <p>✓ Úspešných: {response.stats.successCount}</p>
                  <p>✗ Zlyhaných: {response.stats.failedCount}</p>
                  <p>Celkovo: {response.stats.totalCount}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emails (jeden na riadok)
          </label>
          <textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="john@example.com&#10;jane@example.com&#10;..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Nájdené: {recipients.split('\n').filter((e) => e.includes('@')).length} emailov
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Predmet
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Predmet emailu"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Správa (HTML)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="<p>Ahoj,</p><p>Toto je správa...</p>"
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
        >
          <Send size={18} />
          {sending ? 'Odosielam...' : 'Odoslať Emaily'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 Tip: HTML správu môžete formátovať s paragrafmi, odsekmi a inými HTML značkami.
        </p>
      </div>
    </div>
  );
}
