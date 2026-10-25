import { Categoria } from '../entidades/categoria';

import {
    CategoriaConProductosError,
    CategoriaNoEncontradaError,
    CategoriaRepetidaError,
} from '../errores/catalogoErrores';

import { ICategoriaRepository } from '../repositories/iCategoriaRepository';

import { IProductosRepository } from '../repositories/iProductoRepository';

import { validarAdministrador } from '../../../usuarios/dominio/reglas/validarAdministrador';

import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


export type DatosCategoria = Omit<Categoria, 'id'>;


export class CategoriaService {

    constructor(
        private readonly categoriaRepo:
            ICategoriaRepository,

        private readonly productoRepo:
            IProductosRepository,

        private readonly usuarioRepo:
            IUsuarioRepository,
    ) { }


    // las categorias las puede ver cualquiera.
    async listar(): Promise<Categoria[]> {

        return this.categoriaRepo.listar();
    }


    async obtenerPorId(
        categoriaId: number,
    ): Promise<Categoria> {

        const categoria =
            await this.categoriaRepo.obtenerPorId(
                categoriaId,
            );

        if (!categoria) {
            throw new CategoriaNoEncontradaError(
                categoriaId,
            );
        }

        return categoria;
    }


    // solo el admin crea categorias y no se pueden repetir nombres.
    async crear(
        usuarioId: number,
        datos: DatosCategoria,
    ): Promise<Categoria> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'crear categorías',
        );

        await this.validarNombreLibre(
            datos.nombre,
        );

        return this.categoriaRepo.guardar({
            id: 0,
            ...datos,
        });
    }


    async modificar(
        usuarioId: number,
        categoriaId: number,
        datos: Partial<DatosCategoria>,
    ): Promise<Categoria> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'modificar categorías',
        );

        const categoria =
            await this.obtenerPorId(
                categoriaId,
            );


        // solo revisamos el nombre si de verdad lo cambiaron.
        if (
            datos.nombre !== undefined &&
            datos.nombre.toLowerCase() !==
            categoria.nombre.toLowerCase()
        ) {
            await this.validarNombreLibre(
                datos.nombre,
            );
        }

        const actualizada =
            await this.categoriaRepo.actualizar({
                ...categoria,
                ...datos,
            });

        return actualizada!;
    }


    // no se puede borrar una categoria que todavia tiene productos,
    // primero hay que pasarlos a otra categoria.
    async eliminar(
        usuarioId: number,
        categoriaId: number,
    ): Promise<void> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'eliminar categorías',
        );

        await this.obtenerPorId(
            categoriaId,
        );

        const productos =
            await this.productoRepo.listar({
                categoriaId,
            });

        if (productos.length > 0) {
            throw new CategoriaConProductosError();
        }

        await this.categoriaRepo.eliminar(
            categoriaId,
        );
    }


    private async validarNombreLibre(
        nombre: string,
    ): Promise<void> {

        const existente =
            await this.categoriaRepo.obtenerPorNombre(
                nombre,
            );

        if (existente) {
            throw new CategoriaRepetidaError(
                nombre,
            );
        }
    }
}
