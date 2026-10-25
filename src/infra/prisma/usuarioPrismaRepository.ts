import { Usuario } from '../../usuarios/dominio/entidades/usuario';

import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

import { IUsuarioRepository } from '../../usuarios/dominio/repositories/iUsuarioRepository';

import { Usuario as FilaUsuario } from '../../generated/prisma/client';

import { PrismaService } from './prisma.service';


export class UsuarioPrismaRepository
    implements IUsuarioRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    async guardar(
        usuario: Usuario,
    ): Promise<Usuario> {

        // el id lo genera la base de datos, por eso no se manda.
        const fila =
            await this.prisma.usuario.create({
                data: {
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    contraseniaHash: usuario.contraseniaHash,
                    rol: usuario.rol,
                    telefono: usuario.telefono,
                },
            });

        return this.aDominio(fila);
    }


    async obtenerPorId(
        id: number,
    ): Promise<Usuario | null> {

        const fila =
            await this.prisma.usuario.findUnique({
                where: { id },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    async obtenerPorCorreo(
        correo: string,
    ): Promise<Usuario | null> {

        const fila =
            await this.prisma.usuario.findUnique({
                where: { correo },
            });

        return fila
            ? this.aDominio(fila)
            : null;
    }


    async actualizar(
        usuario: Usuario,
    ): Promise<Usuario | null> {

        const existente =
            await this.prisma.usuario.findUnique({
                where: { id: usuario.id },
            });

        if (!existente) {
            return null;
        }

        const fila =
            await this.prisma.usuario.update({
                where: { id: usuario.id },
                data: {
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    contraseniaHash: usuario.contraseniaHash,
                    rol: usuario.rol,
                    telefono: usuario.telefono,
                },
            });

        return this.aDominio(fila);
    }


    // convierte la fila de la base de datos en la entidad del dominio.
    private aDominio(
        fila: FilaUsuario,
    ): Usuario {

        return {
            id: fila.id,
            nombre: fila.nombre,
            correo: fila.correo,
            contraseniaHash: fila.contraseniaHash,
            rol: fila.rol as RolUsuario,
            telefono: fila.telefono,
        };
    }
}
