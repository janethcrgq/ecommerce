// las llamadas del servicio que tienen que ver con las órdenes.
import { api } from '../../api/cliente';
import type { MetodoPago, Orden, Pago } from '../../api/tipos';

export interface ResultadoCompra {
  orden: Orden;
  pago: Pago;
}

// POST /ordenes: convierte el carrito en una orden (el servicio lo hace todo junto
// o nada: descuenta el stock, crea la orden y vacía el carrito)
export function confirmarCompra(direccionId: number, metodoPago: MetodoPago): Promise<ResultadoCompra> {
  return api.post<ResultadoCompra>('/ordenes', { direccionId, metodoPago });
}

// POST /ordenes/:id/pago: el pago es simulado, no se cobra nada real
export function pagarOrden(ordenId: number): Promise<Pago> {
  return api.post<Pago>(`/ordenes/${ordenId}/pago`);
}
