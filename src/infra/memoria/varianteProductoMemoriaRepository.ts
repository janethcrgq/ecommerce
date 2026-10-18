import { VarianteProducto } from '../../catalogo/dominio/entidades/varianteProducto';

import {
  Color,
} from '../../catalogo/dominio/enums/colorEnum';

import {
  Talla,
} from '../../catalogo/dominio/enums/tallaEnum';

import {
  StockInsuficienteError,
  VarianteNoEncontradaError,
} from '../../catalogo/dominio/errores/catalogoErrores';

import {
  IVarianteProductoRepository,
  ItemDescuento,
} from '../../catalogo/dominio/repositories/iVarianteProductoRepository';


export class VarianteProductoMemoriaRepository
implements IVarianteProductoRepository {

  private readonly variantes:
    VarianteProducto[] = [
      {
        id: 1,
        productoId: 1,
        talla: Talla.M,
        color: Color.NEGRO,
        stock: 10,
        stockMinimo: 2,
      },
      {
        id: 2,
        productoId: 2,
        talla: Talla.L,
        color: Color.GRIS,
        stock: 3,
        stockMinimo: 1,
      },
      {
        id: 3,
        productoId: 3,
        talla: Talla.M,
        color: Color.NEGRO,
        stock: 5,
        stockMinimo: 1,
      },
    ];

  private siguienteId = 4;


  async guardar(
    variante: VarianteProducto,
  ): Promise<VarianteProducto> {

    const nueva: VarianteProducto = {
      ...variante,
      id:
        variante.id ||
        this.siguienteId++,
    };

    this.variantes.push({
      ...nueva,
    });

    return {
      ...nueva,
    };
  }


  async obtenerPorId(
    id: number,
  ): Promise<VarianteProducto | null> {

    const variante =
      this.variantes.find(
        (actual) =>
          actual.id === id,
      );

    return variante
      ? { ...variante }
      : null;
  }


  async listarPorProducto(
    productoId: number,
  ): Promise<VarianteProducto[]> {

    return this.variantes
      .filter(
        (variante) =>
          variante.productoId ===
          productoId,
      )
      .map(
        (variante) => ({
          ...variante,
        }),
      );
  }


  async actualizar(
    variante: VarianteProducto,
  ): Promise<VarianteProducto | null> {

    const indice =
      this.variantes.findIndex(
        (actual) =>
          actual.id === variante.id,
      );

    if (indice === -1) {
      return null;
    }


    this.variantes[indice] = {
      ...variante,
    };


    return {
      ...variante,
    };
  }


  async actualizarStock(
    varianteId: number,
    nuevoStock: number,
  ): Promise<void> {

    const variante =
      this.variantes.find(
        (actual) =>
          actual.id === varianteId,
      );

    if (!variante) {
      throw new VarianteNoEncontradaError(
        varianteId,
      );
    }


    variante.stock =
      nuevoStock;
  }


  async descontarStock(
    items: ItemDescuento[],
  ): Promise<void> {

    /*
     * Primero comprobamos todos.
     * Así evitamos modificar algunos y fallar a la mitad.
     */
    for (const item of items) {

      const variante =
        this.variantes.find(
          (actual) =>
            actual.id ===
            item.varianteId,
        );

      if (!variante) {
        throw new VarianteNoEncontradaError(
          item.varianteId,
        );
      }


      if (
        item.cantidad >
        variante.stock
      ) {
        throw new StockInsuficienteError(
          item.cantidad,
          variante.stock,
        );
      }
    }


    // Después de validar todos, realizamos los descuentos.
    for (const item of items) {

      const variante =
        this.variantes.find(
          (actual) =>
            actual.id ===
            item.varianteId,
        )!;

      variante.stock -=
        item.cantidad;
    }
  }
}