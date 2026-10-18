import { Direccion } from '../../usuarios/dominio/entidades/direccion';

import { IDireccionRepository } from '../../usuarios/dominio/repositories/iDireccionRepository';


export class DireccionMemoriaRepository
    implements IDireccionRepository {

    private readonly direcciones:
        Direccion[] = [
            {
                id: 1,
                usuarioId: 1,
                codigoPostal: '85000',
                numeroCasa: '100',
                calle: 'Calle de prueba',
                colonia: 'Centro',
                ciudad: 'Ciudad Obregón',
                estado: 'Sonora',
            },
        ];

    private siguienteId = 2;


    async guardar(
        direccion: Direccion,
    ): Promise<Direccion> {

        const nueva: Direccion = {
            ...direccion,
            id:
                direccion.id ||
                this.siguienteId++,
        };

        this.direcciones.push({
            ...nueva,
        });

        return {
            ...nueva,
        };
    }


    async obtenerPorId(
        id: number,
    ): Promise<Direccion | null> {

        const direccion =
            this.direcciones.find(
                (actual) =>
                    actual.id === id,
            );

        return direccion
            ? { ...direccion }
            : null;
    }


    async listarPorUsuario(
        usuarioId: number,
    ): Promise<Direccion[]> {

        return this.direcciones
            .filter(
                (direccion) =>
                    direccion.usuarioId ===
                    usuarioId,
            )
            .map(
                (direccion) => ({
                    ...direccion,
                }),
            );
    }


    async actualizar(
        direccion: Direccion,
    ): Promise<Direccion | null> {

        const indice =
            this.direcciones.findIndex(
                (actual) =>
                    actual.id === direccion.id,
            );

        if (indice === -1) {
            return null;
        }


        this.direcciones[indice] = {
            ...direccion,
        };


        return {
            ...direccion,
        };
    }
}