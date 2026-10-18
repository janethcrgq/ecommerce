import { Pago } from '../../ordenes/dominio/entidades/pago';

import { IPagoRepository } from '../../ordenes/dominio/repositories/iPagoRepository';


export class PagoMemoriaRepository
    implements IPagoRepository {

    private readonly pagos:
        Pago[] = [];

    private siguienteId = 1;


    async guardar(
        pago: Pago,
    ): Promise<Pago> {

        const nuevo: Pago = {
            ...pago,

            id:
                pago.id ||
                this.siguienteId++,
        };


        this.pagos.push({
            ...nuevo,
        });


        return {
            ...nuevo,
        };
    }


    async obtenerPorOrden(
        ordenId: number,
    ): Promise<Pago | null> {

        const pago =
            this.pagos.find(
                (actual) =>
                    actual.ordenId ===
                    ordenId,
            );

        return pago
            ? { ...pago }
            : null;
    }


    async actualizar(
        pago: Pago,
    ): Promise<Pago | null> {

        const indice =
            this.pagos.findIndex(
                (actual) =>
                    actual.id === pago.id,
            );

        if (indice === -1) {
            return null;
        }


        this.pagos[indice] = {
            ...pago,
        };


        return {
            ...pago,
        };
    }
}