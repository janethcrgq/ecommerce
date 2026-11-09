// el UNICO lugar de la aplicación que habla con la red.
// ninguna pantalla importa axios: todas usan api de este archivo.
// aquí también se interpreta, una sola vez, el formato uniforme del servicio:
//   éxito:  { ok: true, datos: ... }
//   error:  { ok: false, statusCode, mensaje, codigo, ruta, fecha }
import axios, { type AxiosRequestConfig } from 'axios';
import { borrarSesion, leerToken } from './almacenSesion';
import { URL_API } from './config';
import { ErrorApi, mensajeParaUsuario } from './errores';
import type { RespuestaError, RespuestaOk } from './tipos';

const http = axios.create({
  baseURL: URL_API,
  // si en 8 segundos no responde, se toma como error
  timeout: 8000,
});


// cuando la credencial ya no sirve, el contexto de sesión nos dice que hacer.
// se registra desde afuera para que este archivo no dependa de react.
let alExpirarSesion: () => void = () => { };

export function registrarAlExpirarSesion(funcion: () => void): void {
  alExpirarSesion = funcion;
}


// lo mismo para saber si el servicio responde o no: cada petición que llega
// avisa que sí hay conexión, y una que no recibe respuesta avisa que no.
let alCambiarConexion: (hayConexion: boolean) => void = () => { };

export function registrarAlCambiarConexion(funcion: (hayConexion: boolean) => void): void {
  alCambiarConexion = funcion;
}


// antes de cada petición, si hay token se manda en el encabezado Authorization.
// las rutas de /auth (iniciar sesión y registro) no lo necesitan.
http.interceptors.request.use((config) => {
  const token = leerToken();

  if (token && !config.url?.startsWith('/auth/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// convierte cualquier fallo en un ErrorApi con mensaje para la persona
function aErrorApi(error: unknown): ErrorApi {
  if (!axios.isAxiosError<RespuestaError>(error)) {
    return new ErrorApi('Ocurrió un problema inesperado. Intenta de nuevo.', 'otro');
  }

  // sin respuesta: el servicio está apagado, no hay internet o tardó demasiado
  if (!error.response) {
    alCambiarConexion(false);

    return new ErrorApi(
      'No pudimos conectar con la tienda. Revisa tu conexión o intenta más tarde.',
      'sin_conexion',
    );
  }

  const estado = error.response.status;
  const codigo = error.response.data?.codigo ?? null;

  // 401 en una petición que llevaba token: la credencial expiró o no es válida.
  // se cierra la sesión y se avisa, en vez de dejar pantallas vacías.
  if (estado === 401 && error.config?.headers?.Authorization) {
    borrarSesion();
    alExpirarSesion();

    return new ErrorApi('Tu sesión terminó. Inicia sesión de nuevo.', 'sesion_expirada', 401, codigo);
  }

  const tipo = estado >= 500 ? 'servidor' : estado === 409 ? 'regla' : 'otro';

  return new ErrorApi(mensajeParaUsuario(estado, codigo), tipo, estado, codigo);
}


// hace la petición y regresa solo los "datos" de la respuesta
async function pedir<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const respuesta = await http.request<RespuestaOk<T>>(config);

    alCambiarConexion(true);
    return respuesta.data.datos;
  } catch (error) {
    // un error con respuesta (400, 409...) también prueba que el servicio está vivo
    if (axios.isAxiosError(error) && error.response) alCambiarConexion(true);

    throw aErrorApi(error);
  }
}


export const api = {
  get: <T>(url: string, params?: object) =>
    pedir<T>({ method: 'get', url, params }),

  post: <T>(url: string, cuerpo?: object) =>
    pedir<T>({ method: 'post', url, data: cuerpo }),

  patch: <T>(url: string, cuerpo?: object) =>
    pedir<T>({ method: 'patch', url, data: cuerpo }),

  put: <T>(url: string, cuerpo?: object) =>
    pedir<T>({ method: 'put', url, data: cuerpo }),

  delete: <T = void>(url: string) =>
    pedir<T>({ method: 'delete', url }),
};
