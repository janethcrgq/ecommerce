import { EstadoPago } from '../enums/estadoPagoEnum';
import { MetodoPago } from '../enums/metodoPagoEnum';

export interface Pago {
  id: number;
  ordenId: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  monto: number;
}