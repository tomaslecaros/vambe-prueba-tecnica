'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadFile } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { UploadResponse } from '@/types';

interface FileUploadProps {
  onUploadSuccess?: (data: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
}

export function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      handleSelectFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectFile(file);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await uploadFile(selectedFile);
      onUploadSuccess?.(response);
      setSelectedFile(null);
      setUploadError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setUploadError(errorMessage);
      setSelectedFile(null); // Resetear archivo para permitir nuevo intento
      onUploadError?.(error as Error);

      if (process.env.NODE_ENV === 'development') {
        console.log('[FileUpload] Error capturado y mostrado en UI:', errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
    setUploadError(null); // Limpiar error al seleccionar nuevo archivo
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Subir Archivo</h2>

      {/* Error Alert - Siempre arriba */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                Error al subir archivo
              </h3>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          )}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Arrastra un archivo aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Formatos: .xlsx, .csv (máximo 10MB)
          </p>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="outline" asChild>
              <span>Seleccionar Archivo</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
        </div>
      )}
    </Card>
  );
}
