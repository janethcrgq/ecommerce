import { AjusteInventario } from '../../inventario/dominio/entidades/ajusteInventario';

import { Motivo } from '../../inventario/dominio/enums/motivoEnum';

import { IAjusteInventarioRepository } from '../../inventario/dominio/repositories/iAjusteInventarioRepository';

import { AjusteInventario as FilaAjuste } from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class AjusteInventarioPrismaRepository
    implements IAjusteInventarioRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        ajuste: AjusteInventario,
    ): Promise<AjusteInventario> {

        const fila =
            await this.prisma.ajusteInventario.create({
                data: {
                    varianteId: ajuste.varianteId,
                    usuarioId: ajuste.usuarioId,
                    fecha: ajuste.fecha,
                    cantidad: ajuste.cantidad,
                    motivo: ajuste.motivo,
                },
            });

        return this.aDominio(fila);
    }


    // los mas recientes primero.
    async listar(): Promise<AjusteInventario[]> {

        const filas =
            await this.prisma.ajusteInventario.findMany({
                orderBy: { id: 'desc' },
            });

        return filas.map(
            (fila) =>
                this.aDominio(fila),
        );
    }


    async listarPorVariante(
        varianteId: number,
    ): Promise<AjusteInventario[]> {

        const filas =
            await this.prisma.ajusteInventario.findMany({
                where: { varianteId },
                orderBy: { id: 'desc' },
            });

        return filas.map(
            (fila) =>
                this.aDominio(fila),
        );
    }


    private aDominio(
        fila: FilaAjuste,
    ): AjusteInventario {

        return {
            id: fila.id,
            varianteId: fila.varianteId,
            usuarioId: fila.usuarioId,
            fecha: fila.fecha,
            cantidad: fila.cantidad,
            motivo: fila.motivo as Motivo,
        };
    }
}
