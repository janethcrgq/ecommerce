import {
    Controller,
    Get,
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

import { FiltrosVarianteDto } from './dto/inventario.dto';


@ApiTags('inventario')
@Controller('variantes')
@Proteger(RolUsuario.ADMINISTRADOR)
export class VariantesController {

    constructor(
        private readonly inventarioService:
            InventarioService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Listar variantes con su stock (stockBajo=true: solo las que están en alerta)',
    })
    async listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query() filtros: FiltrosVarianteDto,
    ) {

        return this.inventarioService
            .listarVariantes(
                usuario.id,
                filtros.stockBajo === 'true',
            );
    }
}
