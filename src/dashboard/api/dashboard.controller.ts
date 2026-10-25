import {
    Controller,
    Get,
    Query,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiPropertyOptional,
    ApiTags,
} from '@nestjs/swagger';

import {
    IsDateString,
    IsOptional,
} from 'class-validator';

import { Proteger } from '../../auth/proteger.decorator';

import { UsuarioActual } from '../../auth/usuarioActual.decorator';

import { UsuarioAutenticado } from '../../auth/usuarioAutenticado';

import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

import { DashboardService } from '../dominio/services/dashboardService';


// periodo opcional del resumen. si no lo mandan, se toman los últimos 30 días.
export class PeriodoDto {

    @ApiPropertyOptional({ example: '2026-10-01' })
    @IsOptional()
    @IsDateString()
    desde?: string;

    @ApiPropertyOptional({ example: '2026-10-31' })
    @IsOptional()
    @IsDateString()
    hasta?: string;
}


@ApiTags('dashboard')
@Controller('dashboard')
@Proteger(RolUsuario.ADMINISTRADOR)
export class DashboardController {

    constructor(
        private readonly dashboardService:
            DashboardService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Resumen: órdenes de hoy, ventas del periodo, stock bajo y más vendidos',
    })
    async resumen(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query() periodo: PeriodoDto,
    ) {

        const desde =
            periodo.desde
                ? new Date(periodo.desde)
                : undefined;

        const hasta =
            periodo.hasta
                ? new Date(periodo.hasta)
                : undefined;

        // si solo mandaron el día (AAAA-MM-DD), incluimos ese día completo.
        if (
            hasta &&
            periodo.hasta!.length === 10
        ) {
            hasta.setUTCHours(23, 59, 59, 999);
        }

        return this.dashboardService
            .obtenerResumen(
                usuario.id,
                desde,
                hasta,
            );
    }
}
