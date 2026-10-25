import { ItemCarrito } from '../entidades/itemCarrito';

import {
  CantidadInvalidaError,
  ItemNoEncontradoError,
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

import { Color } from '../../../catalogo/dominio/enums/colorEnum';

import { Talla } from '../../../catalogo/dominio/enums/tallaEnum';


// un renglon del carrito ya con los datos que se necesitan para mostrarlo
export interface ItemCarritoDetalle {
  varianteId: number;
  productoId: number;
  nombre: string;
  imagen: string;
  talla: Talla;
  color: Color;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stockDisponible: number;
}


export interface CarritoDetalle {
  items: ItemCarritoDetalle[];
  total: number;
}


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


    await this.validarProductoActivo(
      variante.productoId,
    );


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


  // aqui la cantidad es la nueva cantidad final, no se suma a la anterior.
  async modificarCantidad(
    usuarioId: number,
    varianteId: number,
    cantidad: number,
  ): Promise<ItemCarrito> {

    this.validarCantidad(cantidad);

    const item =
      await this.buscarItem(
        usuarioId,
        varianteId,
      );

    const variante =
      await this.varianteRepo.obtenerPorId(
        varianteId,
      );

    if (!variante) {
      throw new VarianteNoEncontradaError(
        varianteId,
      );
    }

    await this.validarProductoActivo(
      variante.productoId,
    );

    if (cantidad > variante.stock) {
      throw new StockInsuficienteError(
        cantidad,
        variante.stock,
      );
    }

    item.cantidad =
      cantidad;

    const actualizado =
      await this.carritoRepo.actualizarItem(
        item,
      );

    return actualizado!;
  }


  // arma el carrito con nombre, precio y subtotal de cada renglon.
  async obtener(
    usuarioId: number,
  ): Promise<CarritoDetalle> {

    const carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      return {
        items: [],
        total: 0,
      };
    }


    const items =
      await this.carritoRepo.listarItems(
        carrito.id,
      );

    const detalle: ItemCarritoDetalle[] = [];

    let total = 0;

    for (const item of items) {

      const variante =
        await this.varianteRepo.obtenerPorId(
          item.varianteId,
        );

      if (!variante) {
        throw new VarianteNoEncontradaError(
          item.varianteId,
        );
      }

      const producto =
        await this.productoRepo.obtenerPorId(
          variante.productoId,
        );

      if (!producto) {
        throw new ProductoNoEncontradoError(
          variante.productoId,
        );
      }

      const subtotal =
        producto.precio * item.cantidad;

      total += subtotal;

      detalle.push({
        varianteId: variante.id,
        productoId: producto.id,
        nombre: producto.nombre,
        imagen: producto.imagen,
        talla: variante.talla,
        color: variante.color,
        precioUnitario: producto.precio,
        cantidad: item.cantidad,
        subtotal,
        stockDisponible: variante.stock,
      });
    }


    return {
      items: detalle,
      total,
    };
  }


  // si la variante no esta en el carrito se avisa con un error.
  async eliminarItem(
    usuarioId: number,
    varianteId: number,
  ): Promise<void> {

    const item =
      await this.buscarItem(
        usuarioId,
        varianteId,
      );

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


  private async buscarItem(
    usuarioId: number,
    varianteId: number,
  ): Promise<ItemCarrito> {

    const carrito =
      await this.carritoRepo.obtenerPorUsuario(
        usuarioId,
      );

    if (!carrito) {
      throw new ItemNoEncontradoError(
        varianteId,
      );
    }

    const item =
      await this.carritoRepo.obtenerItemPorVariante(
        carrito.id,
        varianteId,
      );

    if (!item) {
      throw new ItemNoEncontradoError(
        varianteId,
      );
    }

    return item;
  }


  // un producto inactivo no se puede comprar.
  private async validarProductoActivo(
    productoId: number,
  ): Promise<void> {

    const producto =
      await this.productoRepo.obtenerPorId(
        productoId,
      );

    if (!producto) {
      throw new ProductoNoEncontradoError(
        productoId,
      );
    }

    if (!producto.activo) {
      throw new ProductoInactivoError();
    }
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
