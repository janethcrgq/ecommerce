// las llamadas del servicio que tienen que ver con el carrito.
import { api } from '../../api/cliente';
import type { CarritoDetalle } from '../../api/tipos';

// POST /carrito/items: agrega una pieza (variante) al carrito del usuario
export function agregarAlCarrito(varianteId: number, cantidad: number): Promise<CarritoDetalle> {
  return api.post<CarritoDetalle>('/carrito/items', { varianteId, cantidad });
}
