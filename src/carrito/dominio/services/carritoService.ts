import { ItemCarrito } from '../entidades/itemCarrito';

import {
  CantidadInvalidaError,
  ProductoInactivoError,
} from '../errores/carritoErrores';

import { ICarritoRepository } from '../repositories/iCarritoRepository';

import {
  ProductoNoEncontradoError,
  StockInsuficienteError,
  VarianteNoEncontradaError,
} from '../../../catalogo/dominio/errores/catalogoErrores';

import { IProductosRepository } from '../../../catalogo/dominio/repositories/iProductoRepository';

import { IVarianteProductoRepository } from '../../../catalogo/dominio/repositories/iVarianteProductoRepository';


export class CarritoService {

  constructor(
    private readonly carritoRepo: ICarritoRepository,
    private readonly productoRepo: IProductosRepository,
    private readonly varianteRepo: IVarianteProductoRepository,
  ) { }


  async agregar(
    usuarioId: number,
    varianteId: number,
    cantidad: number,
  ): Promise<ItemCarrito> {

    // La cantidad siempre debe ser de al menos una unidad.
    this.validarCantidad(cantidad);


    // Buscamos la variante seleccionada.
    const variante =
      await this.varianteRepo.obtenerPorId(
        varianteId,
      );

    if (!variante) {
      throw new VarianteNoEncontradaError(
        varianteId,
      );
    }


    // Comprobamos que el producto exista y esté activo.
    const producto =
      await this.productoRepo.obtenerPorId(
        variante.productoId,
      );

    if (!producto) {
      throw new ProductoNoEncontradoError(
        variante.productoId,
      );
    }

    if (!producto.activo) {
      throw new ProductoInactivoError();
    }


    // Buscamos el carrito del usuario.
    // Si todavía no tiene uno, se crea.
    let carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      carrito =
        await this.carritoRepo.guardar({
          id: 0,
          usuarioId,
        });
    }


    // Revisamos si la variante ya estaba en el carrito.
    const itemExistente =
      await this.carritoRepo.obtenerItemPorVariante(
        carrito.id,
        varianteId,
      );


    const cantidadActual =
      itemExistente?.cantidad ?? 0;

    const cantidadTotal =
      cantidadActual + cantidad;


    // No se puede superar la existencia disponible.
    if (cantidadTotal > variante.stock) {
      throw new StockInsuficienteError(
        cantidadTotal,
        variante.stock,
      );
    }


    // Si ya existía, solamente actualizamos su cantidad.
    if (itemExistente) {

      itemExistente.cantidad =
        cantidadTotal;

      const actualizado =
        await this.carritoRepo.actualizarItem(
          itemExistente,
        );

      return actualizado!;
    }


    // Si no existía, agregamos un nuevo item.
    return this.carritoRepo.guardarItem({
      id: 0,
      carritoId: carrito.id,
      varianteId,
      cantidad,
    });
  }


  async obtener(
    usuarioId: number,
  ) {

    const carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      return {
        carrito: null,
        items: [],
      };
    }


    const items =
      await this.carritoRepo.listarItems(
        carrito.id,
      );


    return {
      carrito,
      items,
    };
  }


  async eliminarItem(
    usuarioId: number,
    varianteId: number,
  ): Promise<void> {

    const carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      return;
    }


    const item =
      await this.carritoRepo.obtenerItemPorVariante(
        carrito.id,
        varianteId,
      );

    if (!item) {
      return;
    }


    await this.carritoRepo.eliminarItem(
      item.id,
    );
  }


  async vaciar(
    usuarioId: number,
  ): Promise<void> {

    const carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      return;
    }


    await this.carritoRepo.vaciar(
      carrito.id,
    );
  }


  private validarCantidad(
    cantidad: number,
  ): void {

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      throw new CantidadInvalidaError(
        cantidad,
      );
    }
  }
}