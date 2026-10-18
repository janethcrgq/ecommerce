import { Color } from '../enums/colorEnum';
import { Talla } from '../enums/tallaEnum';

export interface VarianteProducto {
  id: number;
  productoId: number;
  talla: Talla;
  color: Color;
  stock: number;
  stockMinimo: number;
}