import {
    Module,
} from '@nestjs/common';

import {
    AppController,
} from './api/app.controller';

import {
    AuthModule,
} from './auth/auth.module';

import {
    CarritoController,
} from './carrito/api/carrito.controller';

import {
    CategoriasController,
} from './catalogo/api/categorias.controller';

import {
    ProductosAdminController,
} from './catalogo/api/productosAdmin.controller';

import {
    ProductosController,
} from './catalogo/api/productos.controller';

import {
    DashboardController,
} from './dashboard/api/dashboard.controller';

import {
    DominioModule,
} from './dominio.module';

import {
    RepositoriosModule,
} from './infra/repositorios.module';

import {
    AjustesController,
} from './inventario/api/ajustes.controller';

import {
    VariantesController,
} from './inventario/api/variantes.controller';

import {
    OrdenesController,
} from './ordenes/api/ordenes.controller';

import {
    DireccionesController,
} from './usuarios/api/direcciones.controller';


@Module({
    imports: [
        // de donde salen los datos (memoria o base de datos).
        RepositoriosModule,

        // los servicios con las reglas del negocio.
        DominioModule,

        // registro, inicio de sesión y credenciales (JWT).
        AuthModule,
    ],

    // un controlador por recurso.
    controllers: [
        AppController,
        ProductosController,
        ProductosAdminController,
        CategoriasController,
        CarritoController,
        DireccionesController,
        OrdenesController,
        VariantesController,
        AjustesController,
        DashboardController,
    ],
})
export class AppModule { }
