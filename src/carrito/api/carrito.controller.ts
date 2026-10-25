import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { Proteger } from '../../auth/proteger.decorator';

import { UsuarioActual } from '../../auth/usuarioActual.decorator';

import { UsuarioAutenticado } from '../../auth/usuarioAutenticado';

import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

import { CarritoService } from '../dominio/services/carritoService';

import {
    AgregarItemDto,
    ModificarCantidadDto,
} from './dto/carrito.dto';


// el carrito es del cliente que tiene la sesión iniciada.
// el id del usuario sale de la credencial, nunca del cuerpo de la petición.
@ApiTags('carrito')
@Controller('carrito')
@Proteger(RolUsuario.CLIENTE)
export class CarritoController {

    constructor(
        private readonly carritoService:
            CarritoService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Ver mi carrito con subtotales y total',
    })
    async obtener(
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {

        return this.carritoService
            .obtener(usuario.id);
    }


    @Post('items')
    @ApiOperation({
        summary: 'Agregar una variante al carrito (si ya estaba, se suma)',
    })
    async agregar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: AgregarItemDto,
    ) {

        return this.carritoService
            .agregar(
                usuario.id,
                dto.varianteId,
                dto.cantidad,
            );
    }


    @Patch('items/:varianteId')
    @ApiOperation({
        summary: 'Cambiar la cantidad de una variante del carrito',
    })
    async modificarCantidad(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'varianteId',
            ParseIntPipe,
        )
        varianteId: number,
        @Body() dto: ModificarCantidadDto,
    ) {

        return this.carritoService
            .modificarCantidad(
                usuario.id,
                varianteId,
                dto.cantidad,
            );
    }


    @Delete('items/:varianteId')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Quitar una variante del carrito',
    })
    async eliminarItem(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'varianteId',
            ParseIntPipe,
        )
        varianteId: number,
    ) {

        await this.carritoService
            .eliminarItem(
                usuario.id,
                varianteId,
            );
    }


    @Delete()
    @HttpCode(200)
    @ApiOperation({
        summary: 'Vaciar el carrito',
    })
    async vaciar(
        @UsuarioActual() usuario: UsuarioAutenticado,
    ) {

        await this.carritoService
            .vaciar(usuario.id);
    }
}
