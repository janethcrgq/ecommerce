import { Envio } from '../../ordenes/dominio/entidades/envio';

import { IEnvioRepository } from '../../ordenes/dominio/repositories/iEnvioRepository';

import { PrismaService } from './prisma.service';


export class EnvioPrismaRepository
    implements IEnvioRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        envio: Envio,
    ): Promise<Envio> {

        return this.prisma.envio.create({
            data: {
                ordenId: envio.ordenId,
                nombrePaqueteria: envio.nombrePaqueteria,
                numeroGuia: envio.numeroGuia,
                fechaEnvio: envio.fechaEnvio,
                fechaEntrega: envio.fechaEntrega,
            },
        });
    }


    // cada orden tiene un solo envio.
    async obtenerPorOrden(
        ordenId: number,
    ): Promise<Envio | null> {

        return this.prisma.envio.findUnique({
            where: { ordenId },
        });
    }


    async actualizar(
        envio: Envio,
    ): Promise<Envio | null> {

        const existente =
            await this.prisma.envio.findUnique({
                where: { id: envio.id },
            });

        if (!existente) {
            return null;
        }

        return this.prisma.envio.update({
            where: { id: envio.id },
            data: {
                nombrePaqueteria: envio.nombrePaqueteria,
                numeroGuia: envio.numeroGuia,
                fechaEnvio: envio.fechaEnvio,
                fechaEntrega: envio.fechaEntrega,
            },
        });
    }
}
