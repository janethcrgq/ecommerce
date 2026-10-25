import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { RolUsuario } from '../usuarios/dominio/enums/rolUsuarioEnum';


@Injectable()
export class AutenticacionGuard
    implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
    ) { }


    // revisa que la petición traiga una credencial válida.
    // sin credencial, alterada o vencida responde 401.
    async canActivate(
        contexto: ExecutionContext,
    ): Promise<boolean> {

        const request =
            contexto.switchToHttp().getRequest();

        const cabecera: string | undefined =
            request.headers['authorization'];

        if (
            !cabecera ||
            !cabecera.startsWith('Bearer ')
        ) {
            throw new UnauthorizedException(
                'Falta la credencial de acceso',
            );
        }

        const token =
            cabecera.slice('Bearer '.length);

        try {

            // verifyAsync comprueba la firma y la fecha de expiración.
            // si alguien cambió el token a mano, la firma ya no coincide.
            const datos =
                await this.jwtService.verifyAsync<{
                    sub: number;
                    rol: RolUsuario;
                }>(token);

            request.usuario = {
                id: datos.sub,
                rol: datos.rol,
            };

            return true;

        } catch {
            throw new UnauthorizedException(
                'La credencial no es válida o ya expiró',
            );
        }
    }
}
