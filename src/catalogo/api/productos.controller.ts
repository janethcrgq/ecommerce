import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { CatalogoService } from '../dominio/services/catalogoService';


@ApiTags('productos')
@Controller('productos')
export class ProductosController {

    constructor(
        private readonly catalogoService:
            CatalogoService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Consultar productos disponibles',
    })
    async listar() {

        return this.catalogoService
            .listarDisponibles();
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Consultar un producto por id',
    })
    async obtener(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.catalogoService
            .obtenerPorId(id);
    }
}