import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  REQUIRED_COLUMNS,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
} from './upload-constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  missingColumns?: string[];
  headers?: string[];
}

export async function validateFile(file: File): Promise<ValidationResult> {
  // Validar extensión
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: 'Tipo de archivo inválido. Solo se permiten archivos .xlsx y .csv',
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Leer headers
  try {
    const headers = await readHeaders(file, extension);

    if (!headers || headers.length === 0) {
      return {
        isValid: false,
        error: 'No se pudieron leer las columnas del archivo',
      };
    }

    // Validar columnas requeridas
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      return {
        isValid: false,
        error: 'Faltan columnas requeridas',
        missingColumns,
        headers,
      };
    }

    return {
      isValid: true,
      headers,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

async function readHeaders(file: File, extension: string): Promise<string[]> {
  if (extension === '.csv') {
    return readCSVHeaders(file);
  } else {
    return readExcelHeaders(file);
  }
}

function readCSVHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1, // Solo leer la primera fila
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          resolve(headers);
        } else {
          reject(new Error('No se encontraron datos en el archivo CSV'));
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

function readExcelHeaders(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', sheetRows: 1 });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData && jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          resolve(headers);
        } else {
          reject(new Error('No se encontraron datos en el archivo Excel'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsBinaryString(file);
  });
}
