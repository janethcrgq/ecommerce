import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
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

import { OrdenService } from '../dominio/services/ordenService';

import {
    CambiarEstadoOrdenDto,
    CambiarEstadoPagoDto,
    ConfirmarCompraDto,
    FiltrosOrdenDto,
    RegistrarEnvioDto,
} from './dto/ordenes.dto';


@ApiTags('ordenes')
@Controller('ordenes')
export class OrdenesController {

    constructor(
        private readonly ordenService:
            OrdenService,
    ) { }


    @Post()
    @Proteger(RolUsuario.CLIENTE)
    @ApiOperation({
        summary: 'Confirmar la compra con lo que hay en el carrito (cliente)',
    })
    async confirmarCompra(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: ConfirmarCompraDto,
    ) {

        return this.ordenService
            .confirmarCompra(
                usuario.id,
                dto.direccionId,
                dto.metodoPago,
            );
    }


    @Get()
    @Proteger(
        RolUsuario.CLIENTE,
        RolUsuario.ADMINISTRADOR,
    )
    @ApiOperation({
        summary: 'Cliente: mis órdenes. Administrador: todas, con filtros',
    })
    async listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query() filtros: FiltrosOrdenDto,
    ) {

        // la fecha llega como texto, aquí la pasamos a fecha de verdad.
        const fechaDesde =
            filtros.fechaDesde
                ? new Date(filtros.fechaDesde)
                : undefined;

        const fechaHasta =
            filtros.fechaHasta
                ? new Date(filtros.fechaHasta)
                : undefined;

        // si solo mandaron el día (AAAA-MM-DD), incluimos ese día completo.
        if (
            fechaHasta &&
            filtros.fechaHasta!.length === 10
        ) {
            fechaHasta.setUTCHours(23, 59, 59, 999);
        }

        return this.ordenService
            .listarOrdenes(
                usuario.id,
                {
                    estado: filtros.estado,
                    usuarioId: filtros.usuarioId,
                    fechaDesde,
                    fechaHasta,
                },
            );
    }


    @Get(':id')
    @Proteger(
        RolUsuario.CLIENTE,
        RolUsuario.ADMINISTRADOR,
    )
    @ApiOperation({
        summary: 'Ver el detalle de una orden (el cliente solo las suyas)',
    })
    async obtener(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.ordenService
            .obtenerOrden(
                usuario.id,
                id,
            );
    }


    @Patch(':id')
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Cambiar el estado de una orden (administrador)',
    })
    async cambiarEstado(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: CambiarEstadoOrdenDto,
    ) {

        return this.ordenService
            .cambiarEstadoOrden(
                usuario.id,
                id,
                dto.estado,
            );
    }


    @Post(':id/pago')
    @HttpCode(200)
    @Proteger(RolUsuario.CLIENTE)
    @ApiOperation({
        summary: 'Pagar mi orden (el pago es simulado, no hay tarjeta real)',
    })
    async pagar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.ordenService
            .pagarOrden(
                usuario.id,
                id,
            );
    }


    @Patch(':id/pago')
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Cambiar el estado de un pago (administrador)',
    })
    async cambiarEstadoPago(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: CambiarEstadoPagoDto,
    ) {

        return this.ordenService
            .cambiarEstadoPago(
                usuario.id,
                id,
                dto.estado,
            );
    }


    @Put(':id/envio')
    @HttpCode(200)
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Registrar paquetería y número de guía (administrador)',
    })
    async registrarEnvio(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: RegistrarEnvioDto,
    ) {

        return this.ordenService
            .registrarEnvio(
                usuario.id,
                id,
                dto.nombrePaqueteria,
                dto.numeroGuia,
            );
    }


    @Get(':id/envio')
    @Proteger(
        RolUsuario.CLIENTE,
        RolUsuario.ADMINISTRADOR,
    )
    @ApiOperation({
        summary: 'Consultar el envío de una orden',
    })
    async consultarEnvio(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.ordenService
            .consultarEnvio(
                usuario.id,
                id,
            );
    }
}
