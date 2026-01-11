'use client';

import React, { useState } from 'react';
import FileList from '../FileList';
import FileUpload from './FileUpload';

export default function FileManager() {
  const [refreshKey, setRefreshKey] = useState(0);

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
      
      // Refresh file list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  const handleUploadSuccess = () => {
    // Refresh file list after upload
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Správa Súborov</h2>
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      <FileList key={refreshKey} isAdmin={true} onDeleteFile={handleDeleteFile} />
    </div>
  );
}
