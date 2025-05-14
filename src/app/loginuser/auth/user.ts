export interface User {
  clave?: string;
  password?: string | null;
  dni?: number;
  nombre?: string;
  email?: string | null;
  direccion?: string | null;
  fotoUrl?: string | null;
  documentoUrl?: string | null;
  tipoUsuario?: string | null;
}
