import { AjusteInventario } from '../../inventario/dominio/entidades/ajusteInventario';

import { IAjusteInventarioRepository } from '../../inventario/dominio/repositories/iAjusteInventarioRepository';


export class AjusteInventarioMemoriaRepository
    implements IAjusteInventarioRepository {

    private readonly ajustes:
        AjusteInventario[] = [];

    private siguienteId = 1;


    async guardar(
        ajuste: AjusteInventario,
    ): Promise<AjusteInventario> {

        const nuevo:
            AjusteInventario = {
            ...ajuste,

            id:
                ajuste.id ||
                this.siguienteId++,
        };


        this.ajustes.push({
            ...nuevo,
        });


        return {
            ...nuevo,
        };
    }


    async listar():
        Promise<AjusteInventario[]> {

        return this.ajustes.map(
            (ajuste) => ({
                ...ajuste,
            }),
        );
    }


    async listarPorVariante(
        varianteId: number,
    ): Promise<AjusteInventario[]> {

        return this.ajustes
            .filter(
                (ajuste) =>
                    ajuste.varianteId ===
                    varianteId,
            )
            .map(
                (ajuste) => ({
                    ...ajuste,
                }),
            );
    }
}