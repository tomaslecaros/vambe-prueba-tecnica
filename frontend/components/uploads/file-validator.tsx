'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { validateFile, ValidationResult } from '@/lib/file-validator';
import { REQUIRED_COLUMNS } from '@/lib/upload-constants';

interface FileValidatorProps {
  onValidFile: (file: File) => void;
  isUploading?: boolean;
}

export function FileValidator({ onValidFile, isUploading }: FileValidatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setValidation(null);
    setIsValidating(true);

    const result = await validateFile(file);
    setValidation(result);
    setIsValidating(false);
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && validation?.isValid) {
      onValidFile(selectedFile);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidation(null);
    setIsValidating(false);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Subir Nuevo Archivo</h3>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-black bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Archivos permitidos: .xlsx, .csv (máx. 10MB)
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx,.csv"
              onChange={handleChange}
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>Seleccionar Archivo</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isValidating || isUploading}
              >
                Cambiar
              </Button>
            </div>

            {isValidating && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Validando columnas del archivo...
                </AlertDescription>
              </Alert>
            )}

            {validation && !isValidating && (
              <>
                {validation.isValid ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Archivo válido. Todas las columnas requeridas están presentes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-2">
                        <p className="font-medium">{validation.error}</p>
                        {validation.missingColumns &&
                          validation.missingColumns.length > 0 && (
                            <div>
                              <p className="text-sm">Columnas faltantes:</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {validation.missingColumns.map((col) => (
                                  <Badge
                                    key={col}
                                    variant="outline"
                                    className="bg-white"
                                  >
                                    {col}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.headers && (
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-2">Columnas detectadas:</p>
                    <div className="flex flex-wrap gap-1">
                      {validation.headers.map((header) => {
                        const isRequired = REQUIRED_COLUMNS.includes(
                          header as any
                        );
                        return (
                          <Badge
                            key={header}
                            variant={isRequired ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {header}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!validation?.isValid || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Subir Archivo'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
