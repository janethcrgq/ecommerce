import { EstadoOrden } from "../../../dominio/enums";
import { MetodoPago } from "../enums/metodoPagoEnum";

export interface Pago{
  id: string,
  estado: EstadoOrden,
  monto: number,
  metodo: MetodoPago,
  ordenId: string
}