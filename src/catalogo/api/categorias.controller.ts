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

import { CategoriaService } from '../dominio/services/categoriaService';

import {
    ActualizarCategoriaDto,
    CrearCategoriaDto,
} from './dto/categorias.dto';


@ApiTags('categorias')
@Controller('categorias')
export class CategoriasController {

    constructor(
        private readonly categoriaService:
            CategoriaService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Listar categorías',
    })
    async listar() {

        return this.categoriaService
            .listar();
    }


    @Post()
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Crear una categoría (administrador)',
    })
    async crear(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: CrearCategoriaDto,
    ) {

        return this.categoriaService
            .crear(
                usuario.id,
                dto,
            );
    }


    @Patch(':id')
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Modificar una categoría (administrador)',
    })
    async modificar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: ActualizarCategoriaDto,
    ) {

        return this.categoriaService
            .modificar(
                usuario.id,
                id,
                dto,
            );
    }


    @Delete(':id')
    @HttpCode(200)
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Eliminar una categoría sin productos (administrador)',
    })
    async eliminar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        await this.categoriaService
            .eliminar(
                usuario.id,
                id,
            );
    }
}
