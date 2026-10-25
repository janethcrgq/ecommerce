import '../configuracion';

import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';


// la llave secreta con la que se firman las credenciales.
// vive en el .env y nunca se sube al repositorio.
const secreto =
    process.env['JWT_SECRET'];

if (!secreto) {
    throw new Error(
        'Falta JWT_SECRET en el archivo .env',
    );
}


@Module({
    imports: [
        JwtModule.register({
            // global para que los guards lo encuentren en cualquier parte.
            global: true,
            secret: secreto,
            signOptions: {
                expiresIn:
                    (process.env['JWT_EXPIRES_IN'] ?? '1h') as never,
            },
        }),
    ],

    controllers: [
        AuthController,
    ],
})
export class AuthModule { }
