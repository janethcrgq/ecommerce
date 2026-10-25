import { VarianteProducto } from '../../catalogo/dominio/entidades/varianteProducto';

import { Color } from '../../catalogo/dominio/enums/colorEnum';

import { Talla } from '../../catalogo/dominio/enums/tallaEnum';

import {
    StockInsuficienteError,
    VarianteNoEncontradaError,
} from '../../catalogo/dominio/errores/catalogoErrores';

import {
    IVarianteProductoRepository,
    ItemDescuento,
} from '../../catalogo/dominio/repositories/iVarianteProductoRepository';

import { VarianteProducto as FilaVariante } from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class VariantePrismaRepository
    implements IVarianteProductoRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        variante: VarianteProducto,
    ): Promise<VarianteProducto> {

        const fila =
            await this.prisma.varianteProducto.create({
                data: {
                    productoId: variante.productoId,
                    talla: variante.talla,
                    color: variante.color,
                    stock: variante.stock,
                    stockMinimo: variante.stockMinimo,
                },
            });

        return this.aDominio(fila);
    }


    async obtenerPorId(
        id: number,
    ): Promise<VarianteProducto | null> {

        const fila =
            await this.prisma.varianteProducto.findUnique({
                where: { id },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    async listar(): Promise<VarianteProducto[]> {

        const filas =
            await this.prisma.varianteProducto.findMany({
                orderBy: { id: 'asc' },
            });

        return filas.map(
            (fila) =>
                this.aDominio(fila),
        );
    }


    // en la base la combinacion producto + talla + color es unica.
    async obtenerPorProductoTallaColor(
        productoId: number,
        talla: Talla,
        color: Color,
    ): Promise<VarianteProducto | null> {

        const fila =
            await this.prisma.varianteProducto.findUnique({
                where: {
                    productoId_talla_color: {
                        productoId,
                        talla,
                        color,
                    },
                },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    async listarPorProducto(
        productoId: number,
    ): Promise<VarianteProducto[]> {

        const filas =
            await this.prisma.varianteProducto.findMany({
                where: { productoId },
                orderBy: { id: 'asc' },
            });

        return filas.map(
            (fila) =>
                this.aDominio(fila),
        );
    }


    async actualizar(
        variante: VarianteProducto,
    ): Promise<VarianteProducto | null> {

        const existente =
            await this.prisma.varianteProducto.findUnique({
                where: { id: variante.id },
            });

        if (!existente) {
            return null;
        }

        const fila =
            await this.prisma.varianteProducto.update({
                where: { id: variante.id },
                data: {
                    talla: variante.talla,
                    color: variante.color,
                    stock: variante.stock,
                    stockMinimo: variante.stockMinimo,
                },
            });

        return this.aDominio(fila);
    }


    async actualizarStock(
        varianteId: number,
        nuevoStock: number,
    ): Promise<void> {

        const resultado =
            await this.prisma.varianteProducto.updateMany({
                where: { id: varianteId },
                data: { stock: nuevoStock },
            });

        if (resultado.count === 0) {
            throw new VarianteNoEncontradaError(
                varianteId,
            );
        }
    }


    // descuenta todas las variantes en una transaccion:
    // si una no alcanza, no se descuenta ninguna.
    async descontarStock(
        items: ItemDescuento[],
    ): Promise<void> {

        await this.prisma.$transaction(
            async (tx) => {

                for (const item of items) {

                    // solo descuenta si todavia alcanza el stock.
                    // asi dos compras al mismo tiempo no dejan stock negativo.
                    const resultado =
                        await tx.varianteProducto.updateMany({
                            where: {
                                id: item.varianteId,
                                stock: {
                                    gte: item.cantidad,
                                },
                            },
                            data: {
                                stock: {
                                    decrement: item.cantidad,
                                },
                            },
                        });

                    if (resultado.count === 0) {

                        const variante =
                            await tx.varianteProducto.findUnique({
                                where: { id: item.varianteId },
                            });

                        if (!variante) {
                            throw new VarianteNoEncontradaError(
                                item.varianteId,
                            );
                        }

                        throw new StockInsuficienteError(
                            item.cantidad,
                            variante.stock,
                        );
                    }
                }
            },
        );
    }


    private aDominio(
        fila: FilaVariante,
    ): VarianteProducto {

        return {
            id: fila.id,
            productoId: fila.productoId,
            talla: fila.talla as Talla,
            color: fila.color as Color,
            stock: fila.stock,
            stockMinimo: fila.stockMinimo,
        };
    }
}
