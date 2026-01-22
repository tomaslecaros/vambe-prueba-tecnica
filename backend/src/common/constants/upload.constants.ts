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
export const UPLOAD_BATCH_SIZE = 50;
