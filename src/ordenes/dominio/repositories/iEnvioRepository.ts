import { Envio } from '../entidades/envio';

export interface IEnvioRepository {
    guardar(
        envio: Envio,
    ): Promise<Envio>;

    obtenerPorOrden(
        ordenId: number,
    ): Promise<Envio | null>;

    actualizar(
        envio: Envio,
    ): Promise<Envio | null>;
}