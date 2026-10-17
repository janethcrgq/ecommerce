import { VarianteProducto } from "../entidades/varianteProducto";

export interface ItemDescuento{
  varianteId: string,
  cantidad: number;
}

export interface IVarianteProductoRepository{
  guardar(variante: VarianteProducto): Promise<VarianteProducto>;
  obtenerPorId(id: string): Promise<VarianteProducto | null>;
  listarPorProducto(productoId: string): Promise<VarianteProducto[]>;
  actualizarStock(varianteId: string, nuevoStock: number): Promise<void>;
  descontarStock(items: ItemDescuento[]): Promise<void>;
}