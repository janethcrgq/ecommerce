import { Producto } from '../entidades/producto';

export interface FiltrosProducto {
  categoriaId?: number;
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  // por qué campo ordenar la lista y en qué dirección.
  ordenarPor?: 'precio' | 'nombre';
  direccion?: 'asc' | 'desc';
}

export interface IProductosRepository {
  guardar(producto: Producto): Promise<Producto>;

  obtenerPorId(
    id: number,
  ): Promise<Producto | null>;

  listar(
    filtros?: FiltrosProducto,
  ): Promise<Producto[]>;

  actualizar(
    producto: Producto,
  ): Promise<Producto | null>;
}