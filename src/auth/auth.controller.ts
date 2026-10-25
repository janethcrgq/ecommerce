import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { UsuarioService } from '../usuarios/dominio/services/usuarioService';

import {
    RegistroDto,
    SesionDto,
} from './dto/auth.dto';


@ApiTags('auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly usuarioService:
            UsuarioService,

        private readonly jwtService:
            JwtService,
    ) { }


    @Post('registro')
    @ApiOperation({
        summary: 'Crear una cuenta de cliente',
    })
    async registro(
        @Body() dto: RegistroDto,
    ) {

        return this.usuarioService.registrar(
            dto.nombre,
            dto.correo,
            dto.contrasenia,
            dto.telefono,
        );
    }


    @Post('sesion')
    @ApiOperation({
        summary: 'Iniciar sesión y recibir la credencial (JWT)',
    })
    async sesion(
        @Body() dto: SesionDto,
    ) {

        const usuario =
            await this.usuarioService.iniciarSesion(
                dto.correo,
                dto.contrasenia,
            );

        // la credencial lleva el id y el rol, y expira según JWT_EXPIRES_IN.
        const token =
            await this.jwtService.signAsync({
                sub: usuario.id,
                rol: usuario.rol,
            });

        return {
            token,
            usuario,
        };
    }
}
