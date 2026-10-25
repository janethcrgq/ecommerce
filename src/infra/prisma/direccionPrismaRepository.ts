import { Direccion } from '../../usuarios/dominio/entidades/direccion';

import { IDireccionRepository } from '../../usuarios/dominio/repositories/iDireccionRepository';

import { PrismaService } from './prisma.service';


export class DireccionPrismaRepository
    implements IDireccionRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        direccion: Direccion,
    ): Promise<Direccion> {

        return this.prisma.direccion.create({
            data: {
                usuarioId: direccion.usuarioId,
                codigoPostal: direccion.codigoPostal,
                numeroCasa: direccion.numeroCasa,
                calle: direccion.calle,
                colonia: direccion.colonia,
                ciudad: direccion.ciudad,
                estado: direccion.estado,
            },
        });
    }


    async obtenerPorId(
        id: number,
    ): Promise<Direccion | null> {

        return this.prisma.direccion.findUnique({
            where: { id },
        });
    }


    async listarPorUsuario(
        usuarioId: number,
    ): Promise<Direccion[]> {

        return this.prisma.direccion.findMany({
            where: { usuarioId },
            orderBy: { id: 'asc' },
        });
    }


    async actualizar(
        direccion: Direccion,
    ): Promise<Direccion | null> {

        const existente =
            await this.prisma.direccion.findUnique({
                where: { id: direccion.id },
            });

        if (!existente) {
            return null;
        }

        return this.prisma.direccion.update({
            where: { id: direccion.id },
            data: {
                codigoPostal: direccion.codigoPostal,
                numeroCasa: direccion.numeroCasa,
                calle: direccion.calle,
                colonia: direccion.colonia,
                ciudad: direccion.ciudad,
                estado: direccion.estado,
            },
        });
    }
}
