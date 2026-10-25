import { DetalleOrden } from '../../ordenes/dominio/entidades/detalleOrden';
import { Orden } from '../../ordenes/dominio/entidades/orden';
import { Pago } from '../../ordenes/dominio/entidades/pago';

import { EstadoOrden } from '../../ordenes/dominio/enums/estadoOrdenEnum';
import { EstadoPago } from '../../ordenes/dominio/enums/estadoPagoEnum';
import { MetodoPago } from '../../ordenes/dominio/enums/metodoPagoEnum';

import {
    DatosCompra,
    FiltrosOrden,
    IOrdenRepository,
} from '../../ordenes/dominio/repositories/IOrdenRepository';

import {
    StockInsuficienteError,
    VarianteNoEncontradaError,
} from '../../catalogo/dominio/errores/catalogoErrores';

import {
    DetalleOrden as FilaDetalle,
    Orden as FilaOrden,
    Pago as FilaPago,
    Prisma,
} from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class OrdenPrismaRepository
    implements IOrdenRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    // todo pasa dentro de una transaccion.
    // si algo falla (por ejemplo ya no hay stock) se deshace todo
    // y no queda ni la orden ni el stock descontado.
    async confirmarCompra(
        datos: DatosCompra,
    ): Promise<{
        orden: Orden;
        pago: Pago;
    }> {

        return this.prisma.$transaction(
            async (tx) => {

                // 1. descontar el stock de cada variante.
                // solo descuenta si todavia alcanza, asi si dos clientes
                // compran la ultima unidad, la segunda se rechaza.
                for (const detalle of datos.detalles) {

                    const resultado =
                        await tx.varianteProducto.updateMany({
                            where: {
                                id: detalle.varianteId,
                                stock: {
                                    gte: detalle.cantidad,
                                },
                            },
                            data: {
                                stock: {
                                    decrement: detalle.cantidad,
                                },
                            },
                        });

                    if (resultado.count === 0) {

                        const variante =
                            await tx.varianteProducto.findUnique({
                                where: { id: detalle.varianteId },
                            });

                        if (!variante) {
                            throw new VarianteNoEncontradaError(
                                detalle.varianteId,
                            );
                        }

                        throw new StockInsuficienteError(
                            detalle.cantidad,
                            variante.stock,
                        );
                    }
                }


                // 2. guardar la orden junto con sus detalles y su pago.
                const fila =
                    await tx.orden.create({
                        data: {
                            usuarioId: datos.orden.usuarioId,
                            direccionId: datos.orden.direccionId,
                            fecha: datos.orden.fecha,
                            total: datos.orden.total,
                            estado: datos.orden.estado,
                            detalles: {
                                create: datos.detalles.map(
                                    (detalle) => ({
                                        varianteId:
                                            detalle.varianteId,
                                        cantidad:
                                            detalle.cantidad,
                                        precioUnitario:
                                            detalle.precioUnitario,
                                        subtotal:
                                            detalle.subtotal,
                                    }),
                                ),
                            },
                            pago: {
                                create: {
                                    metodo: datos.pago.metodo,
                                    estado: datos.pago.estado,
                                    monto: datos.pago.monto,
                                },
                            },
                        },
                        include: {
                            pago: true,
                        },
                    });


                // 3. vaciar el carrito.
                await tx.itemCarrito.deleteMany({
                    where: {
                        carritoId: datos.carritoId,
                    },
                });


                return {
                    orden: this.aOrden(fila),
                    pago: this.aPago(fila.pago!),
                };
            },
        );
    }


    async guardar(
        orden: Orden,
        detalles: DetalleOrden[],
    ): Promise<Orden> {

        const fila =
            await this.prisma.orden.create({
                data: {
                    usuarioId: orden.usuarioId,
                    direccionId: orden.direccionId,
                    fecha: orden.fecha,
                    total: orden.total,
                    estado: orden.estado,
                    detalles: {
                        create: detalles.map(
                            (detalle) => ({
                                varianteId:
                                    detalle.varianteId,
                                cantidad:
                                    detalle.cantidad,
                                precioUnitario:
                                    detalle.precioUnitario,
                                subtotal:
                                    detalle.subtotal,
                            }),
                        ),
                    },
                },
            });

        return this.aOrden(fila);
    }


    async obtenerPorId(
        id: number,
    ): Promise<Orden | null> {

        const fila =
            await this.prisma.orden.findUnique({
                where: { id },
            });

        return fila
            ? this.aOrden(fila)
            : null;
    }


    // los filtros opcionales se van sumando al where solo si llegaron.
    async listar(
        filtros?: FiltrosOrden,
    ): Promise<Orden[]> {

        const where: Prisma.OrdenWhereInput = {};

        if (filtros?.usuarioId !== undefined) {
            where.usuarioId = filtros.usuarioId;
        }

        if (filtros?.estado !== undefined) {
            where.estado = filtros.estado;
        }

        if (
            filtros?.fechaDesde ||
            filtros?.fechaHasta
        ) {
            where.fecha = {
                gte: filtros.fechaDesde,
                lte: filtros.fechaHasta,
            };
        }

        const filas =
            await this.prisma.orden.findMany({
                where,
                orderBy: { id: 'desc' },
            });

        return filas.map(
            (fila) =>
                this.aOrden(fila),
        );
    }


    async obtenerDetalles(
        ordenId: number,
    ): Promise<DetalleOrden[]> {

        const filas =
            await this.prisma.detalleOrden.findMany({
                where: { ordenId },
                orderBy: { id: 'asc' },
            });

        return filas.map(
            (fila) =>
                this.aDetalle(fila),
        );
    }


    async actualizar(
        orden: Orden,
    ): Promise<Orden | null> {

        const existente =
            await this.prisma.orden.findUnique({
                where: { id: orden.id },
            });

        if (!existente) {
            return null;
        }

        const fila =
            await this.prisma.orden.update({
                where: { id: orden.id },
                data: {
                    estado: orden.estado,
                },
            });

        return this.aOrden(fila);
    }


    // los totales en la base son decimales, en el dominio son number.
    private aOrden(
        fila: FilaOrden,
    ): Orden {

        return {
            id: fila.id,
            usuarioId: fila.usuarioId,
            direccionId: fila.direccionId,
            fecha: fila.fecha,
            total: Number(fila.total),
            estado: fila.estado as EstadoOrden,
        };
    }


    private aDetalle(
        fila: FilaDetalle,
    ): DetalleOrden {

        return {
            id: fila.id,
            ordenId: fila.ordenId,
            varianteId: fila.varianteId,
            cantidad: fila.cantidad,
            precioUnitario: Number(fila.precioUnitario),
            subtotal: Number(fila.subtotal),
        };
    }


    private aPago(
        fila: FilaPago,
    ): Pago {

        return {
            id: fila.id,
            ordenId: fila.ordenId,
            metodo: fila.metodo as MetodoPago,
            estado: fila.estado as EstadoPago,
            monto: Number(fila.monto),
        };
    }
}
