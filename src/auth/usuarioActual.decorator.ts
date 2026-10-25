import {
    ExecutionContext,
    createParamDecorator,
} from '@nestjs/common';

import { UsuarioAutenticado } from './usuarioAutenticado';

// entrega al método del controlador el usuario que viene en la credencial.
// se usa así: metodo(@UsuarioActual() usuario: UsuarioAutenticado)
export const UsuarioActual = createParamDecorator(
    (
        _datos: unknown,
        contexto: ExecutionContext,
    ): UsuarioAutenticado =>
        contexto.switchToHttp().getRequest().usuario,
);
