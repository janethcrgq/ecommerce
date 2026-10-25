import {
    Global,
    Module,
} from '@nestjs/common';

import { CarritoService } from './carrito/dominio/services/carritoService';
import { CatalogoService } from './catalogo/dominio/services/catalogoService';
import { CategoriaService } from './catalogo/dominio/services/categoriaService';
import { DashboardService } from './dashboard/dominio/services/dashboardService';
import { InventarioService } from './inventario/dominio/services/inventarioService';
import { OrdenService } from './ordenes/dominio/services/ordenService';
import { DireccionService } from './usuarios/dominio/services/direccionService';
import { UsuarioService } from './usuarios/dominio/services/usuarioService';

import type { ICarritoRepository } from './carrito/dominio/repositories/iCarritoRepository';
import type { ICategoriaRepository } from './catalogo/dominio/repositories/iCategoriaRepository';
import type { IProductosRepository } from './catalogo/dominio/repositories/iProductoRepository';
import type { IVarianteProductoRepository } from './catalogo/dominio/repositories/iVarianteProductoRepository';
import type { IAjusteInventarioRepository } from './inventario/dominio/repositories/iAjusteInventarioRepository';
import type { IOrdenRepository } from './ordenes/dominio/repositories/IOrdenRepository';
import type { IEnvioRepository } from './ordenes/dominio/repositories/iEnvioRepository';
import type { IPagoRepository } from './ordenes/dominio/repositories/iPagoRepository';
import type { IDireccionRepository } from './usuarios/dominio/repositories/iDireccionRepository';
import type { IUsuarioRepository } from './usuarios/dominio/repositories/iUsuarioRepository';
import type { IEncriptador } from './usuarios/dominio/seguridad/iEncriptador';

import {
    AJUSTE_REPOSITORY,
    CARRITO_REPOSITORY,
    CATEGORIA_REPOSITORY,
    DIRECCION_REPOSITORY,
    ENCRIPTADOR,
    ENVIO_REPOSITORY,
    ORDEN_REPOSITORY,
    PAGO_REPOSITORY,
    PRODUCTO_REPOSITORY,
    USUARIO_REPOSITORY,
    VARIANTE_REPOSITORY,
} from './infra/tokens';


// aqui se arman los servicios del dominio.
// cada uno recibe los repositorios por su contrato (los tokens),
// nunca por la clase concreta.
@Global()
@Module({
    providers: [
        {
            provide: UsuarioService,
            inject: [
                USUARIO_REPOSITORY,
                ENCRIPTADOR,
            ],
            useFactory: (
                usuarioRepo: IUsuarioRepository,
                encriptador: IEncriptador,
            ) =>
                new UsuarioService(
                    usuarioRepo,
                    encriptador,
                ),
        },

        {
            provide: DireccionService,
            inject: [
                DIRECCION_REPOSITORY,
                USUARIO_REPOSITORY,
            ],
            useFactory: (
                direccionRepo: IDireccionRepository,
                usuarioRepo: IUsuarioRepository,
            ) =>
                new DireccionService(
                    direccionRepo,
                    usuarioRepo,
                ),
        },

        {
            provide: CategoriaService,
            inject: [
                CATEGORIA_REPOSITORY,
                PRODUCTO_REPOSITORY,
                USUARIO_REPOSITORY,
            ],
            useFactory: (
                categoriaRepo: ICategoriaRepository,
                productoRepo: IProductosRepository,
                usuarioRepo: IUsuarioRepository,
            ) =>
                new CategoriaService(
                    categoriaRepo,
                    productoRepo,
                    usuarioRepo,
                ),
        },

        {
            provide: CatalogoService,
            inject: [
                PRODUCTO_REPOSITORY,
                VARIANTE_REPOSITORY,
                CATEGORIA_REPOSITORY,
                USUARIO_REPOSITORY,
            ],
            useFactory: (
                productoRepo: IProductosRepository,
                varianteRepo: IVarianteProductoRepository,
                categoriaRepo: ICategoriaRepository,
                usuarioRepo: IUsuarioRepository,
            ) =>
                new CatalogoService(
                    productoRepo,
                    varianteRepo,
                    categoriaRepo,
                    usuarioRepo,
                ),
        },

        {
            provide: CarritoService,
            inject: [
                CARRITO_REPOSITORY,
                PRODUCTO_REPOSITORY,
                VARIANTE_REPOSITORY,
            ],
            useFactory: (
                carritoRepo: ICarritoRepository,
                productoRepo: IProductosRepository,
                varianteRepo: IVarianteProductoRepository,
            ) =>
                new CarritoService(
                    carritoRepo,
                    productoRepo,
                    varianteRepo,
                ),
        },

        {
            provide: OrdenService,
            inject: [
                ORDEN_REPOSITORY,
                CARRITO_REPOSITORY,
                PRODUCTO_REPOSITORY,
                VARIANTE_REPOSITORY,
                USUARIO_REPOSITORY,
                DIRECCION_REPOSITORY,
                PAGO_REPOSITORY,
                ENVIO_REPOSITORY,
            ],
            useFactory: (
                ordenRepo: IOrdenRepository,
                carritoRepo: ICarritoRepository,
                productoRepo: IProductosRepository,
                varianteRepo: IVarianteProductoRepository,
                usuarioRepo: IUsuarioRepository,
                direccionRepo: IDireccionRepository,
                pagoRepo: IPagoRepository,
                envioRepo: IEnvioRepository,
            ) =>
                new OrdenService(
                    ordenRepo,
                    carritoRepo,
                    productoRepo,
                    varianteRepo,
                    usuarioRepo,
                    direccionRepo,
                    pagoRepo,
                    envioRepo,
                ),
        },

        {
            provide: InventarioService,
            inject: [
                VARIANTE_REPOSITORY,
                AJUSTE_REPOSITORY,
                USUARIO_REPOSITORY,
            ],
            useFactory: (
                varianteRepo: IVarianteProductoRepository,
                ajusteRepo: IAjusteInventarioRepository,
                usuarioRepo: IUsuarioRepository,
            ) =>
                new InventarioService(
                    varianteRepo,
                    ajusteRepo,
                    usuarioRepo,
                ),
        },

        {
            provide: DashboardService,
            inject: [
                ORDEN_REPOSITORY,
                VARIANTE_REPOSITORY,
                PRODUCTO_REPOSITORY,
                USUARIO_REPOSITORY,
            ],
            useFactory: (
                ordenRepo: IOrdenRepository,
                varianteRepo: IVarianteProductoRepository,
                productoRepo: IProductosRepository,
                usuarioRepo: IUsuarioRepository,
            ) =>
                new DashboardService(
                    ordenRepo,
                    varianteRepo,
                    productoRepo,
                    usuarioRepo,
                ),
        },
    ],

    exports: [
        UsuarioService,
        DireccionService,
        CategoriaService,
        CatalogoService,
        CarritoService,
        OrdenService,
        InventarioService,
        DashboardService,
    ],
})
export class DominioModule { }
