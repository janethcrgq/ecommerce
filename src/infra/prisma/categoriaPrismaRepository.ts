import { Categoria } from '../../catalogo/dominio/entidades/categoria';

import { ICategoriaRepository } from '../../catalogo/dominio/repositories/iCategoriaRepository';

import { PrismaService } from './prisma.service';


export class CategoriaPrismaRepository
    implements ICategoriaRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        categoria: Categoria,
    ): Promise<Categoria> {

        return this.prisma.categoria.create({
            data: {
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
            },
        });
    }


    async obtenerPorId(
        id: number,
    ): Promise<Categoria | null> {

        return this.prisma.categoria.findUnique({
            where: { id },
        });
    }


    // mysql no distingue mayusculas al comparar, asi que
    // "camisetas" y "Camisetas" cuentan como el mismo nombre.
    async obtenerPorNombre(
        nombre: string,
    ): Promise<Categoria | null> {

        return this.prisma.categoria.findUnique({
            where: { nombre },
        });
    }


    async listar(): Promise<Categoria[]> {

        return this.prisma.categoria.findMany({
            orderBy: { nombre: 'asc' },
        });
    }


    async actualizar(
        categoria: Categoria,
    ): Promise<Categoria | null> {

        const existente =
            await this.prisma.categoria.findUnique({
                where: { id: categoria.id },
            });

        if (!existente) {
            return null;
        }

        return this.prisma.categoria.update({
            where: { id: categoria.id },
            data: {
                nombre: categoria.nombre,
                descripcion: categoria.descripcion,
            },
        });
    }


    async eliminar(
        id: number,
    ): Promise<void> {

        await this.prisma.categoria.deleteMany({
            where: { id },
        });
    }
}
