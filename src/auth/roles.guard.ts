import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { RolUsuario } from '../usuarios/dominio/enums/rolUsuarioEnum';

import { ROLES_PERMITIDOS } from './roles.decorator';

import { UsuarioAutenticado } from './usuarioAutenticado';


@Injectable()
export class RolesGuard
    implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) { }


    // compara el rol de la credencial con los roles que acepta la ruta.
    // si el rol no sirve responde 403 (sin permiso), no un error cualquiera.
    canActivate(
        contexto: ExecutionContext,
    ): boolean {

        const permitidos =
            this.reflector.getAllAndOverride<RolUsuario[]>(
                ROLES_PERMITIDOS,
                [
                    contexto.getHandler(),
                    contexto.getClass(),
                ],
            );

        if (
            !permitidos ||
            permitidos.length === 0
        ) {
            return true;
        }

        const usuario: UsuarioAutenticado | undefined =
            contexto.switchToHttp().getRequest().usuario;

        if (
            !usuario ||
            !permitidos.includes(usuario.rol)
        ) {
            throw new ForbiddenException(
                'No tienes permiso para realizar esta acción',
            );
        }

        return true;
    }
}
