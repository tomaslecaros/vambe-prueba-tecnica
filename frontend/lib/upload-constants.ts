export const REQUIRED_COLUMNS = [
  'Nombre',
  'Correo Electronico',
  'Numero de Telefono',
  'Fecha de la Reunion',
  'Vendedor asignado',
  'closed',
  'Transcripcion',
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['.xlsx', '.csv'] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
