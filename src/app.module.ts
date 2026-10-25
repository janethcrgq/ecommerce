import {
    Module,
} from '@nestjs/common';

import {
    AppController,
} from './api/app.controller';

import {
    ProductosController,
} from './catalogo/api/productos.controller';

import {
    DominioModule,
} from './dominio.module';

import {
    RepositoriosModule,
} from './infra/repositorios.module';


@Module({
    imports: [
        // de donde salen los datos (memoria o base de datos).
        RepositoriosModule,

        // los servicios con las reglas del negocio.
        DominioModule,
    ],

    controllers: [
        AppController,
        ProductosController,
    ],
})
export class AppModule { }
