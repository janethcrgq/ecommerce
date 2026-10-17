import { Carrito } from "../entidades/carrito";

export interface ICarritoRepository{
  obtenerPorUsuario(usuarioId: string): Promise<Carrito | null>;
  guardar(carrito: Carrito): Promise<Carrito>;
  vaciar(carritoId: string): Promise<void>;
  
}