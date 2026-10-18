import { Carrito } from '../entidades/carrito';
import { ItemCarrito } from '../entidades/itemCarrito';

export interface ICarritoRepository {
  obtenerPorUsuario(
    usuarioId: number,
  ): Promise<Carrito | null>;

  guardar(
    carrito: Carrito,
  ): Promise<Carrito>;

  listarItems(
    carritoId: number,
  ): Promise<ItemCarrito[]>;

  obtenerItemPorVariante(
    carritoId: number,
    varianteId: number,
  ): Promise<ItemCarrito | null>;

  guardarItem(
    item: ItemCarrito,
  ): Promise<ItemCarrito>;

  actualizarItem(
    item: ItemCarrito,
  ): Promise<ItemCarrito | null>;

  eliminarItem(
    itemId: number,
  ): Promise<void>;

  vaciar(
    carritoId: number,
  ): Promise<void>;
}