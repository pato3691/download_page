'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface UploadStatus {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    const fileName = file.name;
    
    // Add to uploads list
    setUploads(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploads(prev => prev.map(u => 
            u.fileName === fileName ? { ...u, progress: Math.round(progress) } : u
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setUploads(prev => prev.map(u => 
              u.fileName === fileName 
                ? { ...u, status: 'success', progress: 100 } 
                : u
            ));
            onUploadSuccess?.();
            
            // Remove after 3 seconds
            setTimeout(() => {
              setUploads(prev => prev.filter(u => u.fileName !== fileName));
            }, 3000);
          } else {
            throw new Error(response.error || 'Upload failed');
          }
        } else {
          throw new Error(`HTTP ${xhr.status}`);
        }
      });

      xhr.addEventListener('error', () => {
        setUploads(prev => prev.map(u => 
          u.fileName === fileName 
            ? { ...u, status: 'error', error: 'Chyba pri nahrávaniu' } 
            : u
        ));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      setUploads(prev => prev.map(u => 
        u.fileName === fileName 
          ? { ...u, status: 'error', error: (error as Error).message } 
          : u
      ));
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Nahrať Súbory</h3>
      
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium mb-2">
            Pretiahni súbory sem alebo klikni
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Podporované všetky typy súborov
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Vybrať Súbory
          </button>
        </div>
      </div>

      {/* Upload Status */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploads.map((upload) => (
            <div key={upload.fileName} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {upload.fileName}
                </span>
                <div className="flex items-center gap-2">
                  {upload.status === 'success' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {upload.status === 'uploading' && (
                    <span className="text-xs text-gray-500">{upload.progress}%</span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {upload.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 transition-all"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {upload.status === 'error' && (
                <p className="text-xs text-red-500 mt-2">{upload.error}</p>
              )}

              {/* Success Message */}
              {upload.status === 'success' && (
                <p className="text-xs text-green-500 mt-2">Úspešne nahraté!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
