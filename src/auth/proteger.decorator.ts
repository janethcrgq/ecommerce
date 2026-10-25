import {
    UseGuards,
    applyDecorators,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { RolUsuario } from '../usuarios/dominio/enums/rolUsuarioEnum';

import { AutenticacionGuard } from './autenticacion.guard';

import { Roles } from './roles.decorator';

import { RolesGuard } from './roles.guard';


// con este decorador una ruta (o un controlador completo) queda protegida:
//   1. el AutenticacionGuard pide una credencial válida (si no, 401).
//   2. el RolesGuard revisa que el rol sirva (si no, 403).
// se usa así: @Proteger(RolUsuario.ADMINISTRADOR)
export function Proteger(
    ...roles: RolUsuario[]
) {

    return applyDecorators(
        UseGuards(
            AutenticacionGuard,
            RolesGuard,
        ),
        Roles(...roles),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({
            description: 'No hay credencial, expiró o fue alterada',
        }),
        ApiForbiddenResponse({
            description: 'La credencial es válida pero el rol no tiene permiso',
        }),
    );
}
