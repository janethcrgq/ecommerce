import {
    Body,
    Controller,
    Get,
    Post,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { Proteger } from '../../auth/proteger.decorator';

import { UsuarioActual } from '../../auth/usuarioActual.decorator';

import { UsuarioAutenticado } from '../../auth/usuarioAutenticado';

import { RolUsuario } from '../dominio/enums/rolUsuarioEnum';

import { DireccionService } from '../dominio/services/direccionService';

import { CrearDireccionDto } from './dto/direcciones.dto';


@ApiTags('direcciones')
@Controller('direcciones')
@Proteger(RolUsuario.CLIENTE)
export class DireccionesController {

    constructor(
        private readonly direccionService:
            DireccionService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Ver mis direcciones',
    })
    async listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {

        return this.direccionService
            .listar(usuario.id);
    }


    @Post()
    @ApiOperation({
        summary: 'Registrar una dirección de envío',
    })
    async crear(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: CrearDireccionDto,
    ) {

        return this.direccionService
            .registrar(
                usuario.id,
                dto,
            );
    }
}
