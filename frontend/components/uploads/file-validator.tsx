'use client';

import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateFile, ValidationResult } from '@/lib/file-validator';

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

    // Auto-upload si es válido
    if (result.isValid) {
      onValidFile(file);
      // Reset después de subir
      setTimeout(() => {
        setSelectedFile(null);
        setValidation(null);
      }, 1000);
    }
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

  const handleReset = () => {
    setSelectedFile(null);
    setValidation(null);
    setIsValidating(false);
  };

  // Estado: subiendo
  if (isUploading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm">Subiendo {selectedFile?.name}...</span>
      </div>
    );
  }

  // Estado: validando
  if (isValidating) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm">Validando archivo...</span>
      </div>
    );
  }

  // Estado: archivo inválido
  if (validation && !validation.isValid) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-destructive text-sm">{validation.error}</span>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Estado: listo para arrastrar/seleccionar
  return (
    <div
      className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-lg transition-colors ${
        dragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground flex-1">
        Arrastra un archivo .xlsx o .csv aquí
      </span>
      <input
        type="file"
        id="file-upload-compact"
        className="hidden"
        accept=".xlsx,.csv"
        onChange={handleChange}
      />
      <label htmlFor="file-upload-compact">
        <Button type="button" variant="outline" size="sm" asChild>
          <span>Seleccionar</span>
        </Button>
      </label>
    </div>
  );
}
