import { ItemCarrito } from "./itemCarrito";

export interface Carrito{
  id: string,
  usuarioId: string,
  listaItems: ItemCarrito[];
}