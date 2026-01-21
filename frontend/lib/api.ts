import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Extraer mensaje de error del backend
    let errorMessage = 'Error desconocido al procesar la solicitud';

    if (error.response?.data?.message) {
      // El backend devuelve un mensaje estructurado
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 400) {
      errorMessage = 'Archivo inválido o con formato incorrecto';
    } else if (error.response?.status === 500) {
      errorMessage = 'Error del servidor. Por favor intenta de nuevo.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Crear un error estructurado
    const customError = new Error(errorMessage);
    customError.name = 'APIError';

    // En desarrollo, solo loguear errores 500 (los demás son esperados)
    if (process.env.NODE_ENV === 'development' && error.response?.status !== 500) {
      // Suprimir el log en consola para errores 400 esperados
      return Promise.reject(customError);
    }

    return Promise.reject(customError);
  },
);

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getProgress = async (uploadId: string) => {
  const response = await api.get(`/categorization/${uploadId}/progress`);
  return response.data;
};

export const getAllClients = async (limit: number = 50, offset: number = 0) => {
  const response = await api.get(`/clients?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getUploads = async (limit: number = 20, offset: number = 0, status?: string) => {
  const params = new URLSearchParams();
  params.append('limit', String(limit));
  params.append('offset', String(offset));
  if (status) params.append('status', status);
  const response = await api.get(`/uploads?${params.toString()}`);
  return response.data;
};

export const getUploadClientsWithProgress = async (uploadId: string) => {
  const response = await api.get(`/uploads/${uploadId}/clients`);
  return response.data;
};

export const getDashboards = async () => {
  const response = await api.get('/dashboards');
  return response.data;
};

export const getCategorizations = async (limit: number = 20, offset: number = 0) => {
  const response = await api.get(`/categorization?limit=${limit}&offset=${offset}`);
  return response.data;
};

// Prediction API
export const getPredictionStatus = async () => {
  const response = await api.get('/prediction/status');
  return response.data;
};

export const trainPredictionModel = async () => {
  const response = await api.post('/prediction/train');
  return response.data;
};

export const predictClosure = async (transcription: string) => {
  const response = await api.post('/prediction', { transcription });
  return response.data;
};
