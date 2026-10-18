import { Producto } from '../entidades/producto';

import {
    PrecioInvalidoError,
    ProductoNoEncontradoError,
} from '../errores/catalogoErrores';

import {
    FiltrosProducto,
    IProductosRepository,
} from '../repositories/iProductoRepository';

import { RolUsuario } from '../../../usuarios/dominio/enums/rolUsuarioEnum';

import {
    PermisoDenegadoError,
    UsuarioNoEncontradoError,
} from '../../../usuarios/dominio/errores/usuarioErrores';

import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


export class CatalogoService {

    constructor(
        private readonly productoRepo:
            IProductosRepository,

        private readonly usuarioRepo:
            IUsuarioRepository,
    ) { }


    // El catálogo público solamente muestra productos activos.
    async listarDisponibles(
        filtros?: FiltrosProducto,
    ): Promise<Producto[]> {

        const productos =
            await this.productoRepo.listar(
                filtros,
            );

        return productos.filter(
            (producto) =>
                producto.activo,
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

        await this.validarAdministrador(
            usuarioId,
            'registrar productos',
        );

        this.validarPrecio(
            producto.precio,
        );

        return this.productoRepo.guardar(
            producto,
        );
    }


    // Solamente un administrador puede modificar el catálogo.
    async modificarProducto(
        usuarioId: number,
        producto: Producto,
    ): Promise<Producto> {

        await this.validarAdministrador(
            usuarioId,
            'modificar productos',
        );

        this.validarPrecio(
            producto.precio,
        );


        const existente =
            await this.productoRepo.obtenerPorId(
                producto.id,
            );

        if (!existente) {
            throw new ProductoNoEncontradoError(
                producto.id,
            );
        }


        const actualizado =
            await this.productoRepo.actualizar(
                producto,
            );

        return actualizado!;
    }


    // Permite activar o desactivar un producto.
    async cambiarEstadoProducto(
        usuarioId: number,
        productoId: number,
        activo: boolean,
    ): Promise<Producto> {

        await this.validarAdministrador(
            usuarioId,
            'cambiar el estado de productos',
        );


        const producto =
            await this.productoRepo.obtenerPorId(
                productoId,
            );

        if (!producto) {
            throw new ProductoNoEncontradoError(
                productoId,
            );
        }


        producto.activo =
            activo;


        const actualizado =
            await this.productoRepo.actualizar(
                producto,
            );

        return actualizado!;
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


    private async validarAdministrador(
        usuarioId: number,
        accion: string,
    ): Promise<void> {

        const usuario =
            await this.usuarioRepo.obtenerPorId(
                usuarioId,
            );

        if (!usuario) {
            throw new UsuarioNoEncontradoError();
        }


        if (
            usuario.rol !==
            RolUsuario.ADMINISTRADOR
        ) {
            throw new PermisoDenegadoError(
                accion,
            );
        }
    }
}