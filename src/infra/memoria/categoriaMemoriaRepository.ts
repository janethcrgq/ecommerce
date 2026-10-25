import { Categoria } from '../../catalogo/dominio/entidades/categoria';

import { ICategoriaRepository } from '../../catalogo/dominio/repositories/iCategoriaRepository';


export class CategoriaMemoriaRepository
    implements ICategoriaRepository {

    private readonly categorias: Categoria[] = [
        {
            id: 1,
            nombre: 'Camisetas',
            descripcion: 'Camisetas y playeras',
        },
        {
            id: 2,
            nombre: 'Sudaderas',
            descripcion: 'Sudaderas casuales',
        },
        {
            id: 3,
            nombre: 'Pantalones',
            descripcion: 'Pantalones casuales',
        },
    ];

    private siguienteId = 4;


    async guardar(
        categoria: Categoria,
    ): Promise<Categoria> {

        const nueva: Categoria = {
            ...categoria,
            id:
                categoria.id ||
                this.siguienteId++,
        };

        this.categorias.push({
            ...nueva,
        });

        return {
            ...nueva,
        };
    }


    async obtenerPorId(
        id: number,
    ): Promise<Categoria | null> {

        const categoria =
            this.categorias.find(
                (actual) =>
                    actual.id === id,
            );

        return categoria
            ? { ...categoria }
            : null;
    }


    async obtenerPorNombre(
        nombre: string,
    ): Promise<Categoria | null> {

        const categoria =
            this.categorias.find(
                (actual) =>
                    actual.nombre.toLowerCase() ===
                    nombre.toLowerCase(),
            );

        return categoria
            ? { ...categoria }
            : null;
    }


    async listar():
        Promise<Categoria[]> {

        return this.categorias.map(
            (categoria) => ({
                ...categoria,
            }),
        );
    }


    async actualizar(
        categoria: Categoria,
    ): Promise<Categoria | null> {

        const indice =
            this.categorias.findIndex(
                (actual) =>
                    actual.id === categoria.id,
            );

        if (indice === -1) {
            return null;
        }

        this.categorias[indice] = {
            ...categoria,
        };

        return {
            ...categoria,
        };
    }


    async eliminar(
        id: number,
    ): Promise<void> {

        const indice =
            this.categorias.findIndex(
                (actual) =>
                    actual.id === id,
            );

        if (indice !== -1) {
            this.categorias.splice(
                indice,
                1,
            );
        }
    }
}