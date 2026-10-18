import { VarianteProducto } from '../entidades/varianteProducto';

export interface ItemDescuento {
  varianteId: number;
  cantidad: number;
}

export interface IVarianteProductoRepository {
  guardar(
    variante: VarianteProducto,
  ): Promise<VarianteProducto>;

  obtenerPorId(
    id: number,
  ): Promise<VarianteProducto | null>;

  listarPorProducto(
    productoId: number,
  ): Promise<VarianteProducto[]>;

  actualizar(
    variante: VarianteProducto,
  ): Promise<VarianteProducto | null>;

  actualizarStock(
    varianteId: number,
    nuevoStock: number,
  ): Promise<void>;

  descontarStock(
    items: ItemDescuento[],
  ): Promise<void>;
}