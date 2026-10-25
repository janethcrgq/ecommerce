import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import {
    Color,
    EstadoOrden,
    EstadoPago,
    MetodoPago,
    Motivo,
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


// fecha de hace tantos días, para que las órdenes de ejemplo
// tengan fechas distintas y el dashboard se vea con datos.
function hace(dias: number): Date {
    return new Date(
        Date.now() - dias * 24 * 60 * 60 * 1000,
    );
}


interface ItemOrden {
    varianteId: number;
    cantidad: number;
    precio: number;
}

interface DatosOrden {
    usuarioId: number;
    direccionId: number;
    fecha: Date;
    estado: EstadoOrden;
    metodo: MetodoPago;
    estadoPago: EstadoPago;
    items: ItemOrden[];
    envio?: {
        nombrePaqueteria: string;
        numeroGuia: string;
        fechaEnvio: Date;
        fechaEntrega: Date | null;
    };
}


// crea una orden completa: sus detalles, su pago y su envío (si ya tiene).
async function crearOrden(
    datos: DatosOrden,
): Promise<void> {

    const total = datos.items.reduce(
        (suma, item) =>
            suma + item.precio * item.cantidad,
        0,
    );

    await prisma.orden.create({
        data: {
            usuarioId: datos.usuarioId,
            direccionId: datos.direccionId,
            fecha: datos.fecha,
            total,
            estado: datos.estado,
            detalles: {
                create: datos.items.map((item) => ({
                    varianteId: item.varianteId,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio,
                    subtotal: item.precio * item.cantidad,
                })),
            },
            pago: {
                create: {
                    metodo: datos.metodo,
                    estado: datos.estadoPago,
                    monto: total,
                },
            },
            envio: datos.envio
                ? { create: datos.envio }
                : undefined,
        },
    });
}


async function main(): Promise<void> {
    console.log('Limpiando datos anteriores...');

    // se borra en este orden porque unas tablas dependen de otras.
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

    // los ids vuelven a empezar en 1, así siempre son los mismos
    // sin importar cuántas veces se corra el seed.
    const tablas = [
        'ajustes_inventario',
        'envios',
        'pagos',
        'detalles_orden',
        'ordenes',
        'items_carrito',
        'carritos',
        'variantes_producto',
        'productos',
        'categorias',
        'direcciones',
        'usuarios',
    ];

    for (const tabla of tablas) {
        await prisma.$executeRawUnsafe(
            `ALTER TABLE ${tabla} AUTO_INCREMENT = 1`,
        );
    }


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

    const maria = await prisma.usuario.create({
        data: {
            nombre: 'María López',
            correo: 'maria@tienda.mx',
            contraseniaHash: hashCliente,
            rol: RolUsuario.CLIENTE,
            telefono: '6442222222',
        },
    });


    console.log('Creando direcciones...');

    // el cliente de prueba tiene dos direcciones para poder escoger.
    const direccionCasa =
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

    const direccionTrabajo =
        await prisma.direccion.create({
            data: {
                usuarioId: cliente.id,
                codigoPostal: '85150',
                numeroCasa: '450',
                calle: 'Avenida Universidad',
                colonia: 'Las Quintas',
                ciudad: 'Ciudad Obregón',
                estado: 'Sonora',
            },
        });

    const direccionMaria =
        await prisma.direccion.create({
            data: {
                usuarioId: maria.id,
                codigoPostal: '85010',
                numeroCasa: '88',
                calle: 'Calle Sinaloa',
                colonia: 'Cumuripa',
                ciudad: 'Ciudad Obregón',
                estado: 'Sonora',
            },
        });


    console.log('Creando categorías...');

    const camisetas = await prisma.categoria.create({
        data: {
            nombre: 'Camisetas',
            descripcion: 'Camisetas y playeras',
        },
    });

    const sudaderas = await prisma.categoria.create({
        data: {
            nombre: 'Sudaderas',
            descripcion: 'Sudaderas y prendas abrigadoras',
        },
    });

    const pantalones = await prisma.categoria.create({
        data: {
            nombre: 'Pantalones',
            descripcion: 'Pantalones casuales',
        },
    });

    const accesorios = await prisma.categoria.create({
        data: {
            nombre: 'Accesorios',
            descripcion: 'Gorras y otros accesorios',
        },
    });


    console.log('Creando productos y variantes...');

    // cada producto trae sus variantes (talla y color) con su stock.
    // hay variantes con stock bajo y una agotada para probar las alertas.
    const camisetaNegra = await prisma.producto.create({
        data: {
            categoriaId: camisetas.id,
            nombre: 'Camiseta básica negra',
            descripcion: 'Camiseta casual de color negro',
            precio: 350,
            activo: true,
            imagen: 'camiseta-negra.jpg',
            variantes: {
                create: [
                    { talla: Talla.S, color: Color.NEGRO, stock: 2, stockMinimo: 2 },
                    { talla: Talla.M, color: Color.NEGRO, stock: 10, stockMinimo: 2 },
                    { talla: Talla.L, color: Color.NEGRO, stock: 6, stockMinimo: 2 },
                ],
            },
        },
        include: { variantes: true },
    });

    const camisetaBlanca = await prisma.producto.create({
        data: {
            categoriaId: camisetas.id,
            nombre: 'Camiseta básica blanca',
            descripcion: 'Camiseta casual de color blanco',
            precio: 350,
            activo: true,
            imagen: 'camiseta-blanca.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.BLANCO, stock: 8, stockMinimo: 2 },
                    // agotada: no alcanza para vender, pero el producto sigue activo.
                    { talla: Talla.L, color: Color.BLANCO, stock: 0, stockMinimo: 2 },
                ],
            },
        },
        include: { variantes: true },
    });

    const sudaderaGris = await prisma.producto.create({
        data: {
            categoriaId: sudaderas.id,
            nombre: 'Sudadera gris',
            descripcion: 'Sudadera casual de color gris',
            precio: 650,
            activo: true,
            imagen: 'sudadera-gris.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.GRIS, stock: 5, stockMinimo: 1 },
                    { talla: Talla.L, color: Color.GRIS, stock: 3, stockMinimo: 1 },
                ],
            },
        },
        include: { variantes: true },
    });

    await prisma.producto.create({
        data: {
            categoriaId: sudaderas.id,
            nombre: 'Sudadera azul',
            descripcion: 'Sudadera casual de color azul',
            precio: 700,
            activo: true,
            imagen: 'sudadera-azul.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.AZUL, stock: 4, stockMinimo: 1 },
                ],
            },
        },
    });

    // producto inactivo: existe pero no se muestra ni se puede comprar.
    await prisma.producto.create({
        data: {
            categoriaId: pantalones.id,
            nombre: 'Pantalón negro',
            descripcion: 'Pantalón casual de color negro',
            precio: 500,
            activo: false,
            imagen: 'pantalon-negro.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.NEGRO, stock: 5, stockMinimo: 1 },
                ],
            },
        },
    });

    const pantalonAzul = await prisma.producto.create({
        data: {
            categoriaId: pantalones.id,
            nombre: 'Pantalón azul',
            descripcion: 'Pantalón casual de color azul',
            precio: 550,
            activo: true,
            imagen: 'pantalon-azul.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.AZUL, stock: 7, stockMinimo: 2 },
                    { talla: Talla.L, color: Color.AZUL, stock: 5, stockMinimo: 2 },
                ],
            },
        },
        include: { variantes: true },
    });

    const gorra = await prisma.producto.create({
        data: {
            categoriaId: accesorios.id,
            nombre: 'Gorra beige',
            descripcion: 'Gorra casual de color beige',
            precio: 250,
            activo: true,
            imagen: 'gorra-beige.jpg',
            variantes: {
                create: [
                    { talla: Talla.M, color: Color.BEIGE, stock: 12, stockMinimo: 3 },
                ],
            },
        },
        include: { variantes: true },
    });

    // atajos a las variantes que usamos en las órdenes de ejemplo.
    const camisetaNegraM = camisetaNegra.variantes[1];
    const camisetaBlancaM = camisetaBlanca.variantes[0];
    const sudaderaGrisL = sudaderaGris.variantes[1];
    const pantalonAzulM = pantalonAzul.variantes[0];
    const gorraM = gorra.variantes[0];


    console.log('Creando carritos...');

    // el cliente de prueba empieza con el carrito vacío.
    await prisma.carrito.create({
        data: {
            usuarioId: cliente.id,
        },
    });


    console.log('Creando órdenes de ejemplo...');

    // una orden en cada estado, para poder recorrer todo el flujo.
    await crearOrden({
        usuarioId: cliente.id,
        direccionId: direccionCasa.id,
        fecha: hace(10),
        estado: EstadoOrden.ENTREGADO,
        metodo: MetodoPago.TARJETA,
        estadoPago: EstadoPago.PAGADO,
        items: [
            { varianteId: camisetaNegraM.id, cantidad: 2, precio: 350 },
        ],
        envio: {
            nombrePaqueteria: 'Estafeta',
            numeroGuia: 'GUIA-1001',
            fechaEnvio: hace(9),
            fechaEntrega: hace(6),
        },
    });

    await crearOrden({
        usuarioId: cliente.id,
        direccionId: direccionTrabajo.id,
        fecha: hace(5),
        estado: EstadoOrden.ENVIADO,
        metodo: MetodoPago.TRANSFERENCIA,
        estadoPago: EstadoPago.PAGADO,
        items: [
            { varianteId: sudaderaGrisL.id, cantidad: 1, precio: 650 },
        ],
        envio: {
            nombrePaqueteria: 'DHL',
            numeroGuia: 'GUIA-1002',
            fechaEnvio: hace(4),
            fechaEntrega: null,
        },
    });

    await crearOrden({
        usuarioId: maria.id,
        direccionId: direccionMaria.id,
        fecha: hace(2),
        estado: EstadoOrden.PROCESANDO,
        metodo: MetodoPago.EFECTIVO,
        estadoPago: EstadoPago.PAGADO,
        items: [
            { varianteId: pantalonAzulM.id, cantidad: 1, precio: 550 },
            { varianteId: gorraM.id, cantidad: 1, precio: 250 },
        ],
    });

    await crearOrden({
        usuarioId: maria.id,
        direccionId: direccionMaria.id,
        fecha: new Date(),
        estado: EstadoOrden.PENDIENTE,
        metodo: MetodoPago.TARJETA,
        estadoPago: EstadoPago.PENDIENTE,
        items: [
            { varianteId: camisetaBlancaM.id, cantidad: 1, precio: 350 },
        ],
    });


    console.log('Creando ajustes de inventario...');

    // historial de ejemplo: quién movió el stock, cuándo y por qué.
    await prisma.ajusteInventario.createMany({
        data: [
            {
                varianteId: camisetaNegraM.id,
                usuarioId: admin.id,
                fecha: hace(12),
                cantidad: 10,
                motivo: Motivo.ENTRADA,
            },
            {
                varianteId: camisetaNegra.variantes[0].id,
                usuarioId: admin.id,
                fecha: hace(8),
                cantidad: -1,
                motivo: Motivo.MERMA,
            },
            {
                varianteId: gorraM.id,
                usuarioId: admin.id,
                fecha: hace(3),
                cantidad: 2,
                motivo: Motivo.CORRECCION,
            },
        ],
    });


    console.log('');
    console.log(
        'Seed terminado correctamente.',
    );

    console.log(
        `Administrador: ${admin.correo} / Admin123!`,
    );

    console.log(
        `Cliente: ${cliente.correo} / Cliente123!`,
    );

    console.log(
        `Cliente 2: ${maria.correo} / Cliente123!`,
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
