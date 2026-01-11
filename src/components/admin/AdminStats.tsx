'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Mail, Calendar } from 'lucide-react';

interface DownloadStats {
  totalDownloads: number;
  uniqueEmails: number;
  recentDownloads: Array<{
    email: string;
    file_name: string;
    created_at: string;
  }>;
}

interface EmailLog {
  id: number;
  recipient_email: string;
  status: string;
  sent_at: string;
}

export default function AdminStats() {
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setEmailLogs(data.recentEmailLogs);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítavanie štatistík...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Štatistika</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Celkové Downloads</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats?.totalDownloads || 0}
              </p>
            </div>
            <BarChart3 size={32} className="text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Jedinečné Emaily</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats?.uniqueEmails || 0}
              </p>
            </div>
            <Users size={32} className="text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-600 font-medium">Priemere / Email</p>
              <p className="text-3xl font-bold text-pink-900 mt-2">
                {stats && stats.uniqueEmails > 0
                  ? (stats.totalDownloads / stats.uniqueEmails).toFixed(1)
                  : 0}
              </p>
            </div>
            <Mail size={32} className="text-pink-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Recent Downloads */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Posledné Downloady</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                  Súbor
                </th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">
                  Čas
                </th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentDownloads.map((download, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{download.email}</td>
                  <td className="px-4 py-3 text-gray-600 truncate">
                    {download.file_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(download.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Logs */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Posledné Emaily</h3>
        <div className="space-y-2">
          {emailLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                log.status === 'sent'
                  ? 'bg-green-50 border-green-200'
                  : log.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'sent'
                      ? 'bg-green-600'
                      : log.status === 'failed'
                        ? 'bg-red-600'
                        : 'bg-yellow-600'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {log.recipient_email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {log.status}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
