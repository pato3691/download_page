'use client';

import React from 'react';
import FileList from '../FileList';

export default function FileManager() {
  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Chyba pri mazaní');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Správa Súborov</h2>
      <FileList isAdmin={true} onDeleteFile={handleDeleteFile} />
    </div>
  );
}
