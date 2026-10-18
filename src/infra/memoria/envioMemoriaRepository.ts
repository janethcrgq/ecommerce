import { Envio } from '../../ordenes/dominio/entidades/envio';

import { IEnvioRepository } from '../../ordenes/dominio/repositories/iEnvioRepository';


export class EnvioMemoriaRepository
    implements IEnvioRepository {

    private readonly envios:
        Envio[] = [];

    private siguienteId = 1;


    async guardar(
        envio: Envio,
    ): Promise<Envio> {

        const nuevo: Envio = {
            ...envio,

            id:
                envio.id ||
                this.siguienteId++,
        };


        this.envios.push({
            ...nuevo,
        });


        return {
            ...nuevo,
        };
    }


    async obtenerPorOrden(
        ordenId: number,
    ): Promise<Envio | null> {

        const envio =
            this.envios.find(
                (actual) =>
                    actual.ordenId ===
                    ordenId,
            );

        return envio
            ? { ...envio }
            : null;
    }


    async actualizar(
        envio: Envio,
    ): Promise<Envio | null> {

        const indice =
            this.envios.findIndex(
                (actual) =>
                    actual.id === envio.id,
            );

        if (indice === -1) {
            return null;
        }


        this.envios[indice] = {
            ...envio,
        };


        return {
            ...envio,
        };
    }
}