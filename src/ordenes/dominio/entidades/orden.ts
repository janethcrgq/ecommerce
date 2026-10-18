import { EstadoOrden } from '../enums/estadoOrdenEnum';

export interface Orden {
  id: number;
  usuarioId: number;
  direccionId: number;
  fecha: Date;
  total: number;
  estado: EstadoOrden;
}