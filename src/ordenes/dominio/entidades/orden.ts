import { EstadoOrden } from "../enums/estadoOrdenEnum";

export interface Orden{
  id: string,
  fecha: Date,
  total: number,
  estado: EstadoOrden,
  direccionId: string,
  usuarioId: string,
}