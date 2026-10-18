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
    CatalogoService,
} from './catalogo/dominio/services/catalogoService';

import type {
    IProductosRepository,
} from './catalogo/dominio/repositories/iProductoRepository';

import type {
    IUsuarioRepository,
} from './usuarios/dominio/repositories/iUsuarioRepository';

import {
    ProductoMemoriaRepository,
} from './infra/memoria/productoMemoriaRepository';

import {
    UsuarioMemoriaRepository,
} from './infra/memoria/usuarioMemoriaRepository';

import {
    PRODUCTO_REPOSITORY,
    USUARIO_REPOSITORY,
} from './infra/tokens';


@Module({
    controllers: [
        AppController,
        ProductosController,
    ],

    providers: [
        {
            provide:
                PRODUCTO_REPOSITORY,

            useFactory: () =>
                new ProductoMemoriaRepository(),
        },

        {
            provide:
                USUARIO_REPOSITORY,

            useFactory: () =>
                new UsuarioMemoriaRepository(),
        },

        {
            provide:
                CatalogoService,

            inject: [
                PRODUCTO_REPOSITORY,
                USUARIO_REPOSITORY,
            ],

            useFactory: (
                productoRepo:
                    IProductosRepository,

                usuarioRepo:
                    IUsuarioRepository,
            ) =>
                new CatalogoService(
                    productoRepo,
                    usuarioRepo,
                ),
        },
    ],
})
export class AppModule { }