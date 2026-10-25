import { Producto } from '../../catalogo/dominio/entidades/producto';

import {
    FiltrosProducto,
    IProductosRepository,
} from '../../catalogo/dominio/repositories/iProductoRepository';

import { Prisma } from '../../generated/prisma/client';

import { Producto as FilaProducto } from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class ProductoPrismaRepository
    implements IProductosRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        producto: Producto,
    ): Promise<Producto> {

        const fila =
            await this.prisma.producto.create({
                data: {
                    categoriaId: producto.categoriaId,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    activo: producto.activo,
                    imagen: producto.imagen,
                },
            });

        return this.aDominio(fila);
    }


    async obtenerPorId(
        id: number,
    ): Promise<Producto | null> {

        const fila =
            await this.prisma.producto.findUnique({
                where: { id },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    // los filtros opcionales se van sumando al where solo si llegaron.
    async listar(
        filtros?: FiltrosProducto,
    ): Promise<Producto[]> {

        const where: Prisma.ProductoWhereInput = {};

        if (filtros?.categoriaId !== undefined) {
            where.categoriaId = filtros.categoriaId;
        }

        if (filtros?.nombre) {
            where.nombre = {
                contains: filtros.nombre,
            };
        }

        if (
            filtros?.precioMin !== undefined ||
            filtros?.precioMax !== undefined
        ) {
            where.precio = {
                gte: filtros.precioMin,
                lte: filtros.precioMax,
            };
        }

        const filas =
            await this.prisma.producto.findMany({
                where,
                orderBy: { id: 'asc' },
            });

        return filas.map(
            (fila) =>
                this.aDominio(fila),
        );
    }


    async actualizar(
        producto: Producto,
    ): Promise<Producto | null> {

        const existente =
            await this.prisma.producto.findUnique({
                where: { id: producto.id },
            });

        if (!existente) {
            return null;
        }

        const fila =
            await this.prisma.producto.update({
                where: { id: producto.id },
                data: {
                    categoriaId: producto.categoriaId,
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    activo: producto.activo,
                    imagen: producto.imagen,
                },
            });

        return this.aDominio(fila);
    }


    // el precio en la base es decimal, en el dominio lo manejamos como number.
    private aDominio(
        fila: FilaProducto,
    ): Producto {

        return {
            id: fila.id,
            categoriaId: fila.categoriaId,
            nombre: fila.nombre,
            descripcion: fila.descripcion,
            precio: Number(fila.precio),
            activo: fila.activo,
            imagen: fila.imagen,
        };
    }
}
