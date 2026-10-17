import { Producto } from "../entidades/producto";

export interface FiltrosProducto{
  categoriaId?: string;
  nombre?: string,
  precioMin?: number,
  precioMax?: number
}

export interface IProductosRepository{
  guardar(producto: Producto): Promise<Producto>;
  obtenerPorId(id: string): Promise<Producto | null>;
  listar(filtros?: FiltrosProducto): Promise<Producto[]>;

}