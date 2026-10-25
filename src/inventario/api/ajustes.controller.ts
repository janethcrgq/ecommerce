import {
    Body,
    Controller,
    Get,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { Proteger } from '../../auth/proteger.decorator';

import { UsuarioActual } from '../../auth/usuarioActual.decorator';

import { UsuarioAutenticado } from '../../auth/usuarioAutenticado';

import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

import { InventarioService } from '../dominio/services/inventarioService';

import {
    CrearAjusteDto,
    FiltrosAjusteDto,
} from './dto/inventario.dto';


@ApiTags('inventario')
@Controller('ajustes-inventario')
@Proteger(RolUsuario.ADMINISTRADOR)
export class AjustesController {

    constructor(
        private readonly inventarioService:
            InventarioService,
    ) { }


    @Post()
    @ApiOperation({
        summary: 'Ajustar el inventario manualmente con un motivo',
    })
    async crear(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: CrearAjusteDto,
    ) {

        return this.inventarioService
            .ajustarInventario(
                usuario.id,
                dto.varianteId,
                dto.cantidad,
                dto.motivo,
            );
    }


    @Get()
    @ApiOperation({
        summary: 'Ver el historial de ajustes (varianteId opcional)',
    })
    async listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query() filtros: FiltrosAjusteDto,
    ) {

        return this.inventarioService
            .consultarHistorial(
                usuario.id,
                filtros.varianteId,
            );
    }
}
