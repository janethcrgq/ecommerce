import { VarianteProducto } from '../entidades/varianteProducto';
import { Color } from '../enums/colorEnum';
import { Talla } from '../enums/tallaEnum';

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

  listar(): Promise<VarianteProducto[]>;

  obtenerPorProductoTallaColor(
    productoId: number,
    talla: Talla,
    color: Color,
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