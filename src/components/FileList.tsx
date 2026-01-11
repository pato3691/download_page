'use client';

import React, { useState, useEffect } from 'react';
import { Folder, File, Download, Trash2, FolderOpen } from 'lucide-react';

interface FileItem {
  id?: number;
  file_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  is_folder?: boolean;
  parent_folder_id?: string;
}

interface FileListProps {
  onDownload?: (file: FileItem) => void;
  onDeleteFile?: (fileId: string) => Promise<void>;
  isAdmin?: boolean;
}

export default function FileList({
  onDownload,
  onDeleteFile,
  isAdmin = false,
}: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<string[]>([]);

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const params = currentFolder ? `?parentId=${currentFolder}` : '';
      const response = await fetch(`/api/files${params}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderOpen = (folderId: string) => {
    setFolderStack([...folderStack, currentFolder || '']);
    setCurrentFolder(folderId);
  };

  const handleFolderBack = () => {
    const newStack = [...folderStack];
    const previous = newStack.pop();
    setFolderStack(newStack);
    setCurrentFolder(previous || null);
  };

  const handleDelete = async (fileId: string) => {
    if (!onDeleteFile) return;
    if (!confirm('Ste si istí, že chcete zmazať tento súbor?')) return;

    try {
      await onDeleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      {(currentFolder || folderStack.length > 0) && (
        <div className="mb-4">
          <button
            onClick={handleFolderBack}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
          >
            ← Späť
          </button>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Žiadne súbory</p>
        ) : (
          files.map((file) => (
            <div
              key={file.file_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => {
                  if (file.is_folder) {
                    handleFolderOpen(file.file_id);
                  }
                }}
              >
                {file.is_folder ? (
                  <FolderOpen className="text-yellow-600" size={20} />
                ) : (
                  <File className="text-blue-600" size={20} />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{file.file_name}</p>
                  {!file.is_folder && (
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {!file.is_folder && onDownload && (
                  <button
                    onClick={() => onDownload(file)}
                    className="p-2 hover:bg-purple-100 rounded-lg text-purple-600 transition"
                    title="Stiahnuť"
                  >
                    <Download size={18} />
                  </button>
                )}
                {isAdmin && onDeleteFile && (
                  <button
                    onClick={() => handleDelete(file.file_id)}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                    title="Zmazať"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
