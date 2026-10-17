import { EstadoOrden } from "../enums/estadoOrdenEnum";
import { DetalleOrden } from "./detalleOrden";
import { Envio } from "./envio";
import { Pago } from "./pago";

export interface Orden{
  id: string,
  usuarioId: string,
  fecha: Date,
  total: number,
  estado: EstadoOrden,
  direccionId: string,
  detalles: DetalleOrden[],
  envio: Envio | null,
  pago: Pago | null

}