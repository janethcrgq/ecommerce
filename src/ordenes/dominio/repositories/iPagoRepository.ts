import { Pago } from '../entidades/pago';

export interface IPagoRepository {
    guardar(
        pago: Pago,
    ): Promise<Pago>;

    obtenerPorOrden(
        ordenId: number,
    ): Promise<Pago | null>;

    actualizar(
        pago: Pago,
    ): Promise<Pago | null>;
}