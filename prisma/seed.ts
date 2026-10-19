import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import {
    Color,
    PrismaClient,
    RolUsuario,
    Talla,
} from '../src/generated/prisma/client';

const variables = config().parsed ?? {};

const adapter = new PrismaMariaDb({
    host: variables['DATABASE_HOST'] ?? 'localhost',
    port: Number(variables['DATABASE_PORT'] ?? 3306),
    user: variables['DATABASE_USER'] ?? 'root',
    password: variables['DATABASE_PASSWORD'] ?? '',
    database: variables['DATABASE_NAME'] ?? 'tienda_en_linea',
    connectionLimit: 5,
});

const prisma = new PrismaClient({
    adapter,
});

async function main(): Promise<void> {
    console.log('Limpiando datos anteriores...');

    await prisma.ajusteInventario.deleteMany();
    await prisma.envio.deleteMany();
    await prisma.pago.deleteMany();
    await prisma.detalleOrden.deleteMany();
    await prisma.orden.deleteMany();
    await prisma.itemCarrito.deleteMany();
    await prisma.carrito.deleteMany();
    await prisma.varianteProducto.deleteMany();
    await prisma.producto.deleteMany();
    await prisma.categoria.deleteMany();
    await prisma.direccion.deleteMany();
    await prisma.usuario.deleteMany();

    console.log('Creando usuarios...');

    const hashAdmin = await bcrypt.hash(
        'Admin123!',
        10,
    );

    const hashCliente = await bcrypt.hash(
        'Cliente123!',
        10,
    );

    const admin = await prisma.usuario.create({
        data: {
            nombre: 'Administrador',
            correo: 'admin@tienda.mx',
            contraseniaHash: hashAdmin,
            rol: RolUsuario.ADMINISTRADOR,
            telefono: '6440000000',
        },
    });

    const cliente = await prisma.usuario.create({
        data: {
            nombre: 'Cliente Prueba',
            correo: 'cliente@tienda.mx',
            contraseniaHash: hashCliente,
            rol: RolUsuario.CLIENTE,
            telefono: '6441111111',
        },
    });

    console.log('Creando dirección...');

    await prisma.direccion.create({
        data: {
            usuarioId: cliente.id,
            codigoPostal: '85000',
            numeroCasa: '123',
            calle: 'Calle Principal',
            colonia: 'Centro',
            ciudad: 'Ciudad Obregón',
            estado: 'Sonora',
        },
    });

    console.log('Creando categorías...');

    const categoriaCamisetas =
        await prisma.categoria.create({
            data: {
                nombre: 'Camisetas',
                descripcion: 'Camisetas y playeras',
            },
        });

    const categoriaSudaderas =
        await prisma.categoria.create({
            data: {
                nombre: 'Sudaderas',
                descripcion:
                    'Sudaderas y prendas abrigadoras',
            },
        });

    const categoriaPantalones =
        await prisma.categoria.create({
            data: {
                nombre: 'Pantalones',
                descripcion: 'Pantalones casuales',
            },
        });

    console.log('Creando productos...');

    const camiseta =
        await prisma.producto.create({
            data: {
                categoriaId:
                    categoriaCamisetas.id,
                nombre:
                    'Camiseta básica negra',
                descripcion:
                    'Camiseta casual de color negro',
                precio: 350,
                activo: true,
                imagen:
                    'camiseta-negra.jpg',
            },
        });

    const sudadera =
        await prisma.producto.create({
            data: {
                categoriaId:
                    categoriaSudaderas.id,
                nombre:
                    'Sudadera gris',
                descripcion:
                    'Sudadera casual de color gris',
                precio: 650,
                activo: true,
                imagen:
                    'sudadera-gris.jpg',
            },
        });

    const pantalon =
        await prisma.producto.create({
            data: {
                categoriaId:
                    categoriaPantalones.id,
                nombre:
                    'Pantalón negro',
                descripcion:
                    'Pantalón casual de color negro',
                precio: 500,
                activo: false,
                imagen:
                    'pantalon-negro.jpg',
            },
        });

    console.log('Creando variantes...');

    await prisma.varianteProducto.create({
        data: {
            productoId: camiseta.id,
            talla: Talla.M,
            color: Color.NEGRO,
            stock: 10,
            stockMinimo: 2,
        },
    });

    await prisma.varianteProducto.create({
        data: {
            productoId: sudadera.id,
            talla: Talla.L,
            color: Color.GRIS,
            stock: 3,
            stockMinimo: 1,
        },
    });

    await prisma.varianteProducto.create({
        data: {
            productoId: pantalon.id,
            talla: Talla.M,
            color: Color.NEGRO,
            stock: 5,
            stockMinimo: 1,
        },
    });

    console.log(
        'Creando carrito del cliente...',
    );

    await prisma.carrito.create({
        data: {
            usuarioId: cliente.id,
        },
    });

    console.log('');
    console.log(
        'Seed terminado correctamente.',
    );

    console.log(
        `Administrador: ${admin.correo}`,
    );

    console.log(
        'Contraseña de prueba: Admin123!',
    );

    console.log(
        `Cliente: ${cliente.correo}`,
    );

    console.log(
        'Contraseña de prueba: Cliente123!',
    );
}

main()
    .catch((error: unknown) => {
        console.error(
            'Error al ejecutar seed:',
            error,
        );

        throw error;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });