// las llamadas del servicio que tienen que ver con la sesión.
import { api } from '../../api/cliente';
import type { Sesion, Usuario } from '../../api/tipos';

export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasenia: string;
  telefono: string;
}

// POST /auth/sesion: regresa la credencial (token) y quién eres
export function pedirSesion(correo: string, contrasenia: string): Promise<Sesion> {
  return api.post<Sesion>('/auth/sesion', { correo, contrasenia });
}

// POST /auth/registro: crea la cuenta de cliente
export function pedirRegistro(datos: DatosRegistro): Promise<Usuario> {
  return api.post<Usuario>('/auth/registro', datos);
}
