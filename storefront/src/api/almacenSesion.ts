// guarda el token y el usuario en el navegador (localStorage) para que la sesión
// no se pierda al recargar la página.
// todo va dentro de try/catch porque el navegador puede bloquear el almacenamiento.
import type { Usuario } from './tipos';

const LLAVE_TOKEN = 'token';
const LLAVE_USUARIO = 'usuario';

export function leerToken(): string | null {
  try {
    return localStorage.getItem(LLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function leerUsuario(): Usuario | null {
  try {
    const guardado = localStorage.getItem(LLAVE_USUARIO);

    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token: string, usuario: Usuario): void {
  try {
    localStorage.setItem(LLAVE_TOKEN, token);
    localStorage.setItem(LLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // si no se puede guardar, la sesión dura solo mientras la página siga abierta
  }
}

export function borrarSesion(): void {
  try {
    localStorage.removeItem(LLAVE_TOKEN);
    localStorage.removeItem(LLAVE_USUARIO);
  } catch {
    // no hay nada que borrar
  }
}
