import { Usuario } from '../../usuarios/dominio/entidades/usuario';

import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

import { IUsuarioRepository } from '../../usuarios/dominio/repositories/iUsuarioRepository';


export class UsuarioMemoriaRepository
    implements IUsuarioRepository {

    private readonly usuarios:
        Usuario[] = [
            {
                id: 1,
                nombre: 'Cliente Prueba',
                correo: 'cliente@tienda.mx',

                // hash de bcrypt de la contraseña Cliente123!
                contraseniaHash: '$2b$10$dQRTW6lGOAhbihCY4lBSbOJytMc.NPwE9FeyTwRKzpiJDA5353Bda',

                rol: RolUsuario.CLIENTE,
                telefono: '6440000001',
            },
            {
                id: 2,
                nombre: 'Administrador',
                correo: 'admin@tienda.mx',

                // hash de bcrypt de la contraseña Admin123!
                contraseniaHash: '$2b$10$Vuae.Fvlpb9PJ6PJq1RE9Og9ZCGwDJzZhLjKKPKs5JUuif6/tWMhi',

                rol: RolUsuario.ADMINISTRADOR,
                telefono: '6440000002',
            },
        ];

    private siguienteId = 3;


    async guardar(
        usuario: Usuario,
    ): Promise<Usuario> {

        const nuevo: Usuario = {
            ...usuario,
            id:
                usuario.id ||
                this.siguienteId++,
        };

        this.usuarios.push({
            ...nuevo,
        });

        return {
            ...nuevo,
        };
    }


    async obtenerPorId(
        id: number,
    ): Promise<Usuario | null> {

        const usuario =
            this.usuarios.find(
                (actual) =>
                    actual.id === id,
            );

        return usuario
            ? { ...usuario }
            : null;
    }


    async obtenerPorCorreo(
        correo: string,
    ): Promise<Usuario | null> {

        const usuario =
            this.usuarios.find(
                (actual) =>
                    actual.correo === correo,
            );

        return usuario
            ? { ...usuario }
            : null;
    }


    async actualizar(
        usuario: Usuario,
    ): Promise<Usuario | null> {

        const indice =
            this.usuarios.findIndex(
                (actual) =>
                    actual.id === usuario.id,
            );

        if (indice === -1) {
            return null;
        }


        this.usuarios[indice] = {
            ...usuario,
        };


        return {
            ...usuario,
        };
    }
}