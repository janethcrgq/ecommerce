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
    IVarianteProductoRepository,
} from './catalogo/dominio/repositories/iVarianteProductoRepository';

import type {
    ICategoriaRepository,
} from './catalogo/dominio/repositories/iCategoriaRepository';

import type {
    IUsuarioRepository,
} from './usuarios/dominio/repositories/iUsuarioRepository';

import {
    VarianteProductoMemoriaRepository,
} from './infra/memoria/varianteProductoMemoriaRepository';

import {
    CategoriaMemoriaRepository,
} from './infra/memoria/categoriaMemoriaRepository';

import {
    ProductoMemoriaRepository,
} from './infra/memoria/productoMemoriaRepository';

import {
    UsuarioMemoriaRepository,
} from './infra/memoria/usuarioMemoriaRepository';

import {
    CATEGORIA_REPOSITORY,
    PRODUCTO_REPOSITORY,
    USUARIO_REPOSITORY,
    VARIANTE_REPOSITORY,
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
                VARIANTE_REPOSITORY,

            useFactory: () =>
                new VarianteProductoMemoriaRepository(),
        },

        {
            provide:
                CATEGORIA_REPOSITORY,

            useFactory: () =>
                new CategoriaMemoriaRepository(),
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
                VARIANTE_REPOSITORY,
                CATEGORIA_REPOSITORY,
                USUARIO_REPOSITORY,
            ],

            useFactory: (
                productoRepo:
                    IProductosRepository,

                varianteRepo:
                    IVarianteProductoRepository,

                categoriaRepo:
                    ICategoriaRepository,

                usuarioRepo:
                    IUsuarioRepository,
            ) =>
                new CatalogoService(
                    productoRepo,
                    varianteRepo,
                    categoriaRepo,
                    usuarioRepo,
                ),
        },
    ],
})
export class AppModule { }