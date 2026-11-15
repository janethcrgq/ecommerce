export interface SobreRespuesta<T> {
  ok: true;
  datos: T;
}

export interface ErrorApi {
  ok: false;
  statusCode: number;
  mensaje: string | string[];
  codigo?: string;
  ruta?: string;
  fecha?: string;
}
