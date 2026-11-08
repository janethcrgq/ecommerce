// las llamadas del servicio que tienen que ver con el catálogo.
import { api } from '../../api/cliente';
import type { Categoria, DetalleProducto, FiltrosProducto, Producto } from '../../api/tipos';

// GET /productos: solo productos activos y con stock
export function listarProductos(filtros: FiltrosProducto = {}): Promise<Producto[]> {
  return api.get<Producto[]>('/productos', filtros);
}

// GET /productos/:id: el producto con sus tallas, colores y stock
export function obtenerProducto(id: number): Promise<DetalleProducto> {
  return api.get<DetalleProducto>(`/productos/${id}`);
}

// GET /categorias
export function listarCategorias(): Promise<Categoria[]> {
  return api.get<Categoria[]>('/categorias');
}
