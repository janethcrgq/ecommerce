// las llamadas del servicio que tienen que ver con las direcciones de envío.
import { api } from '../../api/cliente';
import type { Direccion } from '../../api/tipos';

export type DatosDireccion = Omit<Direccion, 'id' | 'usuarioId'>;

// GET /direcciones: las direcciones del cliente
export function listarDirecciones(): Promise<Direccion[]> {
  return api.get<Direccion[]>('/direcciones');
}

// POST /direcciones: guarda una dirección nueva
export function crearDireccion(datos: DatosDireccion): Promise<Direccion> {
  return api.post<Direccion>('/direcciones', datos);
}
