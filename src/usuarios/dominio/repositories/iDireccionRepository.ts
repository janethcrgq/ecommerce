import { Direccion } from '../entidades/direccion';

export interface IDireccionRepository {
    guardar(
        direccion: Direccion,
    ): Promise<Direccion>;

    obtenerPorId(
        id: number,
    ): Promise<Direccion | null>;

    listarPorUsuario(
        usuarioId: number,
    ): Promise<Direccion[]>;

    actualizar(
        direccion: Direccion,
    ): Promise<Direccion | null>;
}