import { SetMetadata } from '@nestjs/common';

import { RolUsuario } from '../usuarios/dominio/enums/rolUsuarioEnum';

export const ROLES_PERMITIDOS = 'roles_permitidos';

// guarda en la ruta qué roles pueden entrar (lo lee el RolesGuard).
export const Roles = (...roles: RolUsuario[]) =>
    SetMetadata(ROLES_PERMITIDOS, roles);
