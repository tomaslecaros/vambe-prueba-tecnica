import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// DEBUG: Log la URL que estamos usando
console.log('🔍 [FRONTEND] API_URL configurada:', API_URL);
console.log('🔍 [FRONTEND] NEXT_PUBLIC_API_URL env:', process.env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// DEBUG: Log cuando se hace una request
api.interceptors.request.use(
  (config) => {
    console.log('🔍 [FRONTEND] Haciendo request a:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('🔍 [FRONTEND] Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log('✅ [FRONTEND] Response recibida:', response.config.url, response.status);
    return response;
  },
  (error: AxiosError<any>) => {
    // DEBUG: Log detallado del error
    console.error('❌ [FRONTEND] Error en response:');
    console.error('  - URL intentada:', error.config?.baseURL + error.config?.url);
    console.error('  - Método:', error.config?.method);
    console.error('  - Status:', error.response?.status);
    console.error('  - Mensaje:', error.message);
    console.error('  - Código:', error.code);
    console.error('  - Detalles:', error.response?.data || 'No response data');

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

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
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
