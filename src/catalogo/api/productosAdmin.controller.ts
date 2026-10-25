import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
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

import { FiltrosProductoDto } from './dto/productos.dto';


// el catálogo público solo muestra productos activos con stock.
// el administrador necesita ver todos (también inactivos y agotados)
// para poder editarlos o volver a activarlos.
@ApiTags('productos (administrador)')
@Controller('admin/productos')
@Proteger(RolUsuario.ADMINISTRADOR)
export class ProductosAdminController {

    constructor(
        private readonly catalogoService:
            CatalogoService,
    ) { }


    @Get()
    @ApiOperation({
        summary: 'Listar todos los productos, incluidos inactivos y agotados',
    })
    async listar(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Query() filtros: FiltrosProductoDto,
    ) {

        return this.catalogoService
            .listarTodos(
                usuario.id,
                filtros,
            );
    }


    @Get(':id')
    @ApiOperation({
        summary: 'Ver el detalle de un producto, aunque esté inactivo',
    })
    async obtener(
        @UsuarioActual() usuario: UsuarioAutenticado,
        @Param(
            'id',
            ParseIntPipe,
        )
        id: number,
    ) {

        return this.catalogoService
            .obtenerDetalleAdmin(
                usuario.id,
                id,
            );
    }
}
