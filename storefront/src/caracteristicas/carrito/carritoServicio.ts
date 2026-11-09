// las llamadas del servicio que tienen que ver con el carrito.
import { api } from '../../api/cliente';
import type { CarritoDetalle, ItemCarrito } from '../../api/tipos';

// GET /carrito: las piezas del carrito con subtotales y el total
export function obtenerCarrito(): Promise<CarritoDetalle> {
  return api.get<CarritoDetalle>('/carrito');
}

// POST /carrito/items: agrega una pieza (variante). si ya estaba, se suma
export function agregarAlCarrito(varianteId: number, cantidad: number): Promise<ItemCarrito> {
  return api.post<ItemCarrito>('/carrito/items', { varianteId, cantidad });
}

// PATCH /carrito/items/:varianteId: la cantidad nueva final, no se suma a la anterior
export function cambiarCantidad(varianteId: number, cantidad: number): Promise<ItemCarrito> {
  return api.patch<ItemCarrito>(`/carrito/items/${varianteId}`, { cantidad });
}

// DELETE /carrito/items/:varianteId
export function quitarDelCarrito(varianteId: number): Promise<void> {
  return api.delete(`/carrito/items/${varianteId}`);
}

// DELETE /carrito
export function vaciarCarrito(): Promise<void> {
  return api.delete('/carrito');
}
