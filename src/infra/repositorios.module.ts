import '../configuracion';

import {
    Global,
    Module,
    Provider,
} from '@nestjs/common';

import { AjusteInventarioMemoriaRepository } from './memoria/ajusteInventarioMemoriaRepository';
import { CarritoMemoriaRepository } from './memoria/carritoMemoriaRepository';
import { CategoriaMemoriaRepository } from './memoria/categoriaMemoriaRepository';
import { DireccionMemoriaRepository } from './memoria/direccionMemoriaRepository';
import { EnvioMemoriaRepository } from './memoria/envioMemoriaRepository';
import { OrdenMemoriaRepository } from './memoria/ordenMemoriaRepository';
import { PagoMemoriaRepository } from './memoria/pagoMemoriaRepository';
import { ProductoMemoriaRepository } from './memoria/productoMemoriaRepository';
import { UsuarioMemoriaRepository } from './memoria/usuarioMemoriaRepository';
import { VarianteProductoMemoriaRepository } from './memoria/varianteProductoMemoriaRepository';

import { AjusteInventarioPrismaRepository } from './prisma/ajusteInventarioPrismaRepository';
import { CarritoPrismaRepository } from './prisma/carritoPrismaRepository';
import { CategoriaPrismaRepository } from './prisma/categoriaPrismaRepository';
import { DireccionPrismaRepository } from './prisma/direccionPrismaRepository';
import { EnvioPrismaRepository } from './prisma/envioPrismaRepository';
import { OrdenPrismaRepository } from './prisma/ordenPrismaRepository';
import { PagoPrismaRepository } from './prisma/pagoPrismaRepository';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { ProductoPrismaRepository } from './prisma/productoPrismaRepository';
import { UsuarioPrismaRepository } from './prisma/usuarioPrismaRepository';
import { VariantePrismaRepository } from './prisma/variantePrismaRepository';

import { BcryptEncriptador } from './seguridad/bcryptEncriptador';

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
} from './tokens';


// este es el UNICO lugar donde se decide de donde salen los datos.
// con ALMACENAMIENTO=memoria en el .env se usan los repositorios en memoria,
// y sin eso (o con prisma) se usa la base de datos real.
// los servicios del dominio no se enteran de cual se escogio.
const usarMemoria =
    process.env['ALMACENAMIENTO'] === 'memoria';


const repositoriosMemoria: Provider[] = [
    {
        provide: USUARIO_REPOSITORY,
        useClass: UsuarioMemoriaRepository,
    },
    {
        provide: DIRECCION_REPOSITORY,
        useClass: DireccionMemoriaRepository,
    },
    {
        provide: CATEGORIA_REPOSITORY,
        useClass: CategoriaMemoriaRepository,
    },
    {
        provide: PRODUCTO_REPOSITORY,
        useClass: ProductoMemoriaRepository,
    },
    {
        provide: VARIANTE_REPOSITORY,
        useClass: VarianteProductoMemoriaRepository,
    },
    {
        provide: CARRITO_REPOSITORY,
        useClass: CarritoMemoriaRepository,
    },
    {
        provide: PAGO_REPOSITORY,
        useClass: PagoMemoriaRepository,
    },
    {
        provide: ENVIO_REPOSITORY,
        useClass: EnvioMemoriaRepository,
    },
    {
        provide: AJUSTE_REPOSITORY,
        useClass: AjusteInventarioMemoriaRepository,
    },
    {
        // la orden en memoria necesita el stock, el pago y el carrito
        // para poder confirmar la compra completa.
        provide: ORDEN_REPOSITORY,
        inject: [
            VARIANTE_REPOSITORY,
            PAGO_REPOSITORY,
            CARRITO_REPOSITORY,
        ],
        useFactory: (
            varianteRepo: VarianteProductoMemoriaRepository,
            pagoRepo: PagoMemoriaRepository,
            carritoRepo: CarritoMemoriaRepository,
        ) =>
            new OrdenMemoriaRepository(
                varianteRepo,
                pagoRepo,
                carritoRepo,
            ),
    },
];


const repositoriosPrisma: Provider[] = [
    {
        provide: USUARIO_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new UsuarioPrismaRepository(prisma),
    },
    {
        provide: DIRECCION_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new DireccionPrismaRepository(prisma),
    },
    {
        provide: CATEGORIA_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new CategoriaPrismaRepository(prisma),
    },
    {
        provide: PRODUCTO_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new ProductoPrismaRepository(prisma),
    },
    {
        provide: VARIANTE_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new VariantePrismaRepository(prisma),
    },
    {
        provide: CARRITO_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new CarritoPrismaRepository(prisma),
    },
    {
        provide: ORDEN_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new OrdenPrismaRepository(prisma),
    },
    {
        provide: PAGO_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new PagoPrismaRepository(prisma),
    },
    {
        provide: ENVIO_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new EnvioPrismaRepository(prisma),
    },
    {
        provide: AJUSTE_REPOSITORY,
        inject: [PrismaService],
        useFactory: (prisma: PrismaService) =>
            new AjusteInventarioPrismaRepository(prisma),
    },
];


@Global()
@Module({
    // si se usa memoria no hace falta conectarse a la base de datos.
    imports: usarMemoria
        ? []
        : [PrismaModule],

    providers: [
        ...(usarMemoria
            ? repositoriosMemoria
            : repositoriosPrisma),

        {
            provide: ENCRIPTADOR,
            useClass: BcryptEncriptador,
        },
    ],

    exports: [
        USUARIO_REPOSITORY,
        DIRECCION_REPOSITORY,
        CATEGORIA_REPOSITORY,
        PRODUCTO_REPOSITORY,
        VARIANTE_REPOSITORY,
        CARRITO_REPOSITORY,
        ORDEN_REPOSITORY,
        PAGO_REPOSITORY,
        ENVIO_REPOSITORY,
        AJUSTE_REPOSITORY,
        ENCRIPTADOR,
    ],
})
export class RepositoriosModule { }
