import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
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

import { CatalogoService } from '../dominio/services/catalogoService';

import {
    ActualizarProductoDto,
    CrearProductoDto,
    CrearVarianteDto,
    FiltrosProductoDto,
} from './dto/productos.dto';


@ApiTags('productos')
@Controller('productos')
export class ProductosController {

    constructor(
        private readonly catalogoService:
            CatalogoService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Consultar productos disponibles (activos y con stock)',
    })
    async listar(
        @Query() filtros: FiltrosProductoDto,
    ) {

        return this.catalogoService
            .listarDisponibles(filtros);
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Consultar un producto con sus tallas, colores y stock',
    })
    async obtener(
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.catalogoService
            .obtenerDetalle(id);
    }


    @Post()
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Registrar un producto (administrador)',
    })
    async crear(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Body() dto: CrearProductoDto,
    ) {

        return this.catalogoService
            .registrarProducto(
                usuario.id,
                {
                    id: 0,
                    categoriaId: dto.categoriaId,
                    nombre: dto.nombre,
                    descripcion: dto.descripcion,
                    precio: dto.precio,
                    // si no dicen nada, el producto nace activo.
                    activo: dto.activo ?? true,
                    imagen: dto.imagen,
                },
            );
    }


    @Patch(':id')
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Modificar un producto o activarlo/desactivarlo (administrador)',
    })
    async modificar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: ActualizarProductoDto,
    ) {

        return this.catalogoService
            .modificarProducto(
                usuario.id,
                id,
                dto,
            );
    }


    @Post(':id/variantes')
    @Proteger(RolUsuario.ADMINISTRADOR)
    @ApiOperation({
        summary: 'Registrar una variante (talla y color) de un producto (administrador)',
    })
    async crearVariante(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
        @Body() dto: CrearVarianteDto,
    ) {

        return this.catalogoService
            .registrarVariante(
                usuario.id,
                {
                    id: 0,
                    productoId: id,
                    talla: dto.talla,
                    color: dto.color,
                    stock: dto.stock,
                    stockMinimo: dto.stockMinimo ?? 0,
                },
            );
    }
}
