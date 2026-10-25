import { Pago } from '../../ordenes/dominio/entidades/pago';

import { EstadoPago } from '../../ordenes/dominio/enums/estadoPagoEnum';

import { MetodoPago } from '../../ordenes/dominio/enums/metodoPagoEnum';

import { IPagoRepository } from '../../ordenes/dominio/repositories/iPagoRepository';

import { Pago as FilaPago } from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class PagoPrismaRepository
    implements IPagoRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        pago: Pago,
    ): Promise<Pago> {

        const fila =
            await this.prisma.pago.create({
                data: {
                    ordenId: pago.ordenId,
                    metodo: pago.metodo,
                    estado: pago.estado,
                    monto: pago.monto,
                },
            });

        return this.aDominio(fila);
    }


    // cada orden tiene un solo pago.
    async obtenerPorOrden(
        ordenId: number,
    ): Promise<Pago | null> {

        const fila =
            await this.prisma.pago.findUnique({
                where: { ordenId },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    async actualizar(
        pago: Pago,
    ): Promise<Pago | null> {

        const existente =
            await this.prisma.pago.findUnique({
                where: { id: pago.id },
            });

        if (!existente) {
            return null;
        }

        const fila =
            await this.prisma.pago.update({
                where: { id: pago.id },
                data: {
                    metodo: pago.metodo,
                    estado: pago.estado,
                    monto: pago.monto,
                },
            });

        return this.aDominio(fila);
    }


    private aDominio(
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
