import { Producto } from '../entidades/producto';

import { VarianteProducto } from '../entidades/varianteProducto';

import {
    CategoriaNoEncontradaError,
    PrecioInvalidoError,
    ProductoNoEncontradoError,
    VarianteRepetidaError,
} from '../errores/catalogoErrores';

import { ICategoriaRepository } from '../repositories/iCategoriaRepository';

import {
    FiltrosProducto,
    IProductosRepository,
} from '../repositories/iProductoRepository';

import { IVarianteProductoRepository } from '../repositories/iVarianteProductoRepository';

import { StockNegativoError } from '../../../inventario/dominio/errores/inventarioErrores';

import { validarAdministrador } from '../../../usuarios/dominio/reglas/validarAdministrador';

import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


// lo que se ve en la pagina de un producto:
// el producto y todas sus tallas y colores.
export interface DetalleProducto {
    producto: Producto;
    variantes: VarianteProducto[];
}


export class CatalogoService {

    constructor(
        private readonly productoRepo:
            IProductosRepository,

        private readonly varianteRepo:
            IVarianteProductoRepository,

        private readonly categoriaRepo:
            ICategoriaRepository,

        private readonly usuarioRepo:
            IUsuarioRepository,
    ) { }


    // El catálogo público solamente muestra productos activos
    // y que tengan stock en alguna de sus variantes.
    async listarDisponibles(
        filtros?: FiltrosProducto,
    ): Promise<Producto[]> {

        const productos =
            await this.productoRepo.listar(
                filtros,
            );

        const disponibles: Producto[] = [];

        for (const producto of productos) {

            if (!producto.activo) {
                continue;
            }

            const variantes =
                await this.varianteRepo.listarPorProducto(
                    producto.id,
                );

            const hayStock =
                variantes.some(
                    (variante) =>
                        variante.stock > 0,
                );

            if (hayStock) {
                disponibles.push(producto);
            }
        }

        return disponibles;
    }


    // el admin si ve todos, tambien los inactivos y los agotados.
    async listarTodos(
        usuarioId: number,
        filtros?: FiltrosProducto,
    ): Promise<Producto[]> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'ver todos los productos',
        );

        return this.productoRepo.listar(
            filtros,
        );
    }


    // detalle publico: un producto inactivo se trata como si no existiera.
    async obtenerDetalle(
        productoId: number,
    ): Promise<DetalleProducto> {

        const producto =
            await this.obtenerPorId(
                productoId,
            );

        if (!producto.activo) {
            throw new ProductoNoEncontradoError(
                productoId,
            );
        }

        return this.armarDetalle(
            producto,
        );
    }


    // detalle para el admin, sin esconder los inactivos.
    async obtenerDetalleAdmin(
        usuarioId: number,
        productoId: number,
    ): Promise<DetalleProducto> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'ver el detalle de productos inactivos',
        );

        const producto =
            await this.obtenerPorId(
                productoId,
            );

        return this.armarDetalle(
            producto,
        );
    }


    // Obtiene un producto por su identificador.
    async obtenerPorId(
        productoId: number,
    ): Promise<Producto> {

        const producto =
            await this.productoRepo.obtenerPorId(
                productoId,
            );

        if (!producto) {
            throw new ProductoNoEncontradoError(
                productoId,
            );
        }

        return producto;
    }


    // Solamente un administrador puede registrar productos.
    async registrarProducto(
        usuarioId: number,
        producto: Producto,
    ): Promise<Producto> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'registrar productos',
        );

        this.validarPrecio(
            producto.precio,
        );

        await this.validarCategoria(
            producto.categoriaId,
        );

        return this.productoRepo.guardar(
            producto,
        );
    }


    // Solamente un administrador puede modificar el catálogo.
    // sirve para editar cualquier campo, tambien para activar o desactivar
    // y para pasar el producto a otra categoria.
    async modificarProducto(
        usuarioId: number,
        productoId: number,
        datos: Partial<Omit<Producto, 'id'>>,
    ): Promise<Producto> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'modificar productos',
        );

        const producto =
            await this.obtenerPorId(
                productoId,
            );

        if (datos.precio !== undefined) {
            this.validarPrecio(
                datos.precio,
            );
        }

        if (datos.categoriaId !== undefined) {
            await this.validarCategoria(
                datos.categoriaId,
            );
        }

        const actualizado =
            await this.productoRepo.actualizar({
                ...producto,
                ...datos,
            });

        return actualizado!;
    }


    // Permite activar o desactivar un producto.
    async cambiarEstadoProducto(
        usuarioId: number,
        productoId: number,
        activo: boolean,
    ): Promise<Producto> {

        return this.modificarProducto(
            usuarioId,
            productoId,
            { activo },
        );
    }


    // cada combinacion de talla y color es una variante con su propio stock.
    async registrarVariante(
        usuarioId: number,
        variante: VarianteProducto,
    ): Promise<VarianteProducto> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'registrar variantes',
        );

        await this.obtenerPorId(
            variante.productoId,
        );

        // el stock nunca puede ser menor que cero.
        if (
            variante.stock < 0 ||
            variante.stockMinimo < 0
        ) {
            throw new StockNegativoError();
        }

        const repetida =
            await this.varianteRepo.obtenerPorProductoTallaColor(
                variante.productoId,
                variante.talla,
                variante.color,
            );

        if (repetida) {
            throw new VarianteRepetidaError();
        }

        return this.varianteRepo.guardar(
            variante,
        );
    }


    private async armarDetalle(
        producto: Producto,
    ): Promise<DetalleProducto> {

        const variantes =
            await this.varianteRepo.listarPorProducto(
                producto.id,
            );

        return {
            producto,
            variantes,
        };
    }


    private async validarCategoria(
        categoriaId: number,
    ): Promise<void> {

        const categoria =
            await this.categoriaRepo.obtenerPorId(
                categoriaId,
            );

        if (!categoria) {
            throw new CategoriaNoEncontradaError(
                categoriaId,
            );
        }
    }


    private validarPrecio(
        precio: number,
    ): void {

        if (
            !Number.isFinite(precio) ||
            precio <= 0
        ) {
            throw new PrecioInvalidoError(
                precio,
            );
        }
    }
}
