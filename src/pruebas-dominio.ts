import { CarritoService } from './carrito/dominio/services/carritoService';

import { CatalogoService } from './catalogo/dominio/services/catalogoService';

import { CategoriaService } from './catalogo/dominio/services/categoriaService';

import { Color } from './catalogo/dominio/enums/colorEnum';

import { Talla } from './catalogo/dominio/enums/tallaEnum';

import { DashboardService } from './dashboard/dominio/services/dashboardService';

import { InventarioService } from './inventario/dominio/services/inventarioService';

import { Motivo } from './inventario/dominio/enums/motivoEnum';

import { OrdenService } from './ordenes/dominio/services/ordenService';

import { EstadoOrden } from './ordenes/dominio/enums/estadoOrdenEnum';

import { MetodoPago } from './ordenes/dominio/enums/metodoPagoEnum';

import { DireccionService } from './usuarios/dominio/services/direccionService';

import { UsuarioService } from './usuarios/dominio/services/usuarioService';

import { ErrorDominio } from './compartido/errorDominio';

import { AjusteInventarioMemoriaRepository } from './infra/memoria/ajusteInventarioMemoriaRepository';

import { CarritoMemoriaRepository } from './infra/memoria/carritoMemoriaRepository';

import { CategoriaMemoriaRepository } from './infra/memoria/categoriaMemoriaRepository';

import { DireccionMemoriaRepository } from './infra/memoria/direccionMemoriaRepository';

import { EnvioMemoriaRepository } from './infra/memoria/envioMemoriaRepository';

import { OrdenMemoriaRepository } from './infra/memoria/ordenMemoriaRepository';

import { PagoMemoriaRepository } from './infra/memoria/pagoMemoriaRepository';

import { ProductoMemoriaRepository } from './infra/memoria/productoMemoriaRepository';

import { UsuarioMemoriaRepository } from './infra/memoria/usuarioMemoriaRepository';

import { VarianteProductoMemoriaRepository } from './infra/memoria/varianteProductoMemoriaRepository';

import { BcryptEncriptador } from './infra/seguridad/bcryptEncriptador';


// Repositorios en memoria.
// Después estos mismos contratos serán implementados con MySQL.
// en el servicio real se cambian por los de prisma en un solo lugar.
const productoRepo =
    new ProductoMemoriaRepository();

const varianteRepo =
    new VarianteProductoMemoriaRepository();

const categoriaRepo =
    new CategoriaMemoriaRepository();

const usuarioRepo =
    new UsuarioMemoriaRepository();

const carritoRepo =
    new CarritoMemoriaRepository();

const direccionRepo =
    new DireccionMemoriaRepository();

const pagoRepo =
    new PagoMemoriaRepository();

const envioRepo =
    new EnvioMemoriaRepository();

const ajusteRepo =
    new AjusteInventarioMemoriaRepository();

// la orden en memoria necesita el stock, el pago y el carrito
// para poder confirmar la compra completa.
const ordenRepo =
    new OrdenMemoriaRepository(
        varianteRepo,
        pagoRepo,
        carritoRepo,
    );

const encriptador =
    new BcryptEncriptador();


// Servicios del dominio modular.
const usuarioService =
    new UsuarioService(
        usuarioRepo,
        encriptador,
    );

const direccionService =
    new DireccionService(
        direccionRepo,
        usuarioRepo,
    );

const categoriaService =
    new CategoriaService(
        categoriaRepo,
        productoRepo,
        usuarioRepo,
    );

const catalogoService =
    new CatalogoService(
        productoRepo,
        varianteRepo,
        categoriaRepo,
        usuarioRepo,
    );

const carritoService =
    new CarritoService(
        carritoRepo,
        productoRepo,
        varianteRepo,
    );

const ordenService =
    new OrdenService(
        ordenRepo,
        carritoRepo,
        productoRepo,
        varianteRepo,
        usuarioRepo,
        direccionRepo,
        pagoRepo,
        envioRepo,
    );

const inventarioService =
    new InventarioService(
        varianteRepo,
        ajusteRepo,
        usuarioRepo,
    );

const dashboardService =
    new DashboardService(
        ordenRepo,
        varianteRepo,
        productoRepo,
        usuarioRepo,
    );


// ids de los usuarios de prueba que ya vienen cargados.
const CLIENTE = 1;
const ADMIN = 2;


// corre un escenario y muestra el error de dominio si la regla lo rechaza.
async function escenario(
    titulo: string,
    accion: () => Promise<void>,
): Promise<void> {

    console.log(
        `\n=== ${titulo} ===`,
    );

    try {
        await accion();

    } catch (error) {

        if (
            error instanceof ErrorDominio
        ) {
            console.log(
                `ERROR DE DOMINIO (${error.name}): ${error.message}`,
            );

            return;
        }

        console.error(error);
    }
}


async function ejecutar(): Promise<void> {

    console.log(
        '\n=== PRUEBAS DEL DOMINIO ===',
    );


    // --- escenario que funciona ---

    await escenario(
        '1. CATÁLOGO: SOLO PRODUCTOS ACTIVOS CON STOCK',
        async () => {

            const productos =
                await catalogoService.listarDisponibles();

            console.log(
                'Productos disponibles:',
                productos.map(
                    (producto) =>
                        producto.nombre,
                ),
            );
        },
    );


    await escenario(
        '2. AGREGAR PRODUCTO AL CARRITO (ESCENARIO EXITOSO)',
        async () => {

            await carritoService.agregar(
                CLIENTE,
                1,
                2,
            );

            const carrito =
                await carritoService.obtener(
                    CLIENTE,
                );

            console.log(
                'Carrito:',
                carrito.items,
            );

            console.log(
                'Total:',
                carrito.total,
            );
        },
    );


    // --- escenarios rechazados por reglas del negocio ---

    await escenario(
        '3. STOCK INSUFICIENTE (RECHAZADO)',
        async () => {

            await carritoService.agregar(
                CLIENTE,
                2,
                5,
            );
        },
    );


    await escenario(
        '4. PRODUCTO INACTIVO (RECHAZADO)',
        async () => {

            await carritoService.agregar(
                CLIENTE,
                3,
                1,
            );
        },
    );


    await escenario(
        '5. CANTIDAD MENOR A UNA UNIDAD (RECHAZADO)',
        async () => {

            await carritoService.agregar(
                CLIENTE,
                1,
                0,
            );
        },
    );


    await escenario(
        '6. MODIFICAR CANTIDAD DEL CARRITO',
        async () => {

            await carritoService.modificarCantidad(
                CLIENTE,
                1,
                4,
            );

            const carrito =
                await carritoService.obtener(
                    CLIENTE,
                );

            console.log(
                'Cantidad nueva:',
                carrito.items[0].cantidad,
            );
        },
    );


    await escenario(
        '7. QUITAR DEL CARRITO ALGO QUE NO ESTÁ (RECHAZADO)',
        async () => {

            await carritoService.eliminarItem(
                CLIENTE,
                2,
            );
        },
    );


    // --- usuarios ---

    await escenario(
        '8. REGISTRO DE USUARIO NUEVO',
        async () => {

            const nuevo =
                await usuarioService.registrar(
                    'Ana Prueba',
                    'ana@tienda.mx',
                    'Ana12345!',
                    '6442222222',
                );

            console.log(
                'Usuario:',
                nuevo,
            );

            await direccionService.registrar(
                nuevo.id,
                {
                    codigoPostal: '85000',
                    numeroCasa: '55',
                    calle: 'Calle Nueva',
                    colonia: 'Centro',
                    ciudad: 'Ciudad Obregón',
                    estado: 'Sonora',
                },
            );
        },
    );


    await escenario(
        '9. REGISTRO CON CORREO REPETIDO (RECHAZADO)',
        async () => {

            await usuarioService.registrar(
                'Otra Ana',
                'ANA@tienda.mx',
                'Ana12345!',
                '6443333333',
            );
        },
    );


    await escenario(
        '10. INICIO DE SESIÓN CORRECTO',
        async () => {

            const usuario =
                await usuarioService.iniciarSesion(
                    'cliente@tienda.mx',
                    'Cliente123!',
                );

            console.log(
                'Entró:',
                usuario.nombre,
                '-',
                usuario.rol,
            );
        },
    );


    await escenario(
        '11. INICIO DE SESIÓN CON CONTRASEÑA INCORRECTA (RECHAZADO)',
        async () => {

            await usuarioService.iniciarSesion(
                'cliente@tienda.mx',
                'contraseña-mala',
            );
        },
    );


    // --- reglas del administrador ---

    await escenario(
        '12. CLIENTE INTENTA REGISTRAR PRODUCTO (RECHAZADO)',
        async () => {

            await catalogoService.registrarProducto(
                CLIENTE,
                {
                    id: 0,
                    categoriaId: 1,
                    nombre: 'Producto de prueba',
                    descripcion: 'Producto de prueba',
                    precio: 200,
                    activo: true,
                    imagen: 'prueba.jpg',
                },
            );
        },
    );


    await escenario(
        '13. ADMIN INTENTA PRECIO INVÁLIDO (RECHAZADO)',
        async () => {

            await catalogoService.registrarProducto(
                ADMIN,
                {
                    id: 0,
                    categoriaId: 1,
                    nombre: 'Producto inválido',
                    descripcion: 'Producto con precio inválido',
                    precio: 0,
                    activo: true,
                    imagen: 'invalido.jpg',
                },
            );
        },
    );


    await escenario(
        '14. ADMIN CREA CATEGORÍA, PRODUCTO Y VARIANTE',
        async () => {

            const categoria =
                await categoriaService.crear(
                    ADMIN,
                    {
                        nombre: 'Gorras',
                        descripcion: 'Gorras y sombreros',
                    },
                );

            const producto =
                await catalogoService.registrarProducto(
                    ADMIN,
                    {
                        id: 0,
                        categoriaId: categoria.id,
                        nombre: 'Gorra negra',
                        descripcion: 'Gorra casual de color negro',
                        precio: 250,
                        activo: true,
                        imagen: 'gorra-negra.jpg',
                    },
                );

            const variante =
                await catalogoService.registrarVariante(
                    ADMIN,
                    {
                        id: 0,
                        productoId: producto.id,
                        talla: Talla.M,
                        color: Color.NEGRO,
                        stock: 8,
                        stockMinimo: 2,
                    },
                );

            console.log(
                'Variante creada:',
                variante,
            );
        },
    );


    await escenario(
        '15. CATEGORÍA REPETIDA (RECHAZADO)',
        async () => {

            await categoriaService.crear(
                ADMIN,
                {
                    nombre: 'camisetas',
                    descripcion: 'Repetida',
                },
            );
        },
    );


    await escenario(
        '16. ELIMINAR CATEGORÍA CON PRODUCTOS (RECHAZADO)',
        async () => {

            await categoriaService.eliminar(
                ADMIN,
                1,
            );
        },
    );


    // --- compra, pago y envio ---

    let ordenId = 0;


    await escenario(
        '17. CONFIRMAR COMPRA',
        async () => {

            const resultado =
                await ordenService.confirmarCompra(
                    CLIENTE,
                    1,
                    MetodoPago.TARJETA,
                );

            ordenId =
                resultado.orden.id;

            console.log(
                'Orden:',
                resultado.orden.id,
            );

            console.log(
                'Total:',
                resultado.orden.total,
            );

            console.log(
                'Estado de orden:',
                resultado.orden.estado,
            );

            console.log(
                'Estado de pago:',
                resultado.pago.estado,
            );

            const carrito =
                await carritoService.obtener(
                    CLIENTE,
                );

            console.log(
                'Items en el carrito después de comprar:',
                carrito.items.length,
            );
        },
    );


    await escenario(
        '18. CONFIRMAR COMPRA CON CARRITO VACÍO (RECHAZADO)',
        async () => {

            await ordenService.confirmarCompra(
                CLIENTE,
                1,
                MetodoPago.EFECTIVO,
            );
        },
    );


    await escenario(
        '19. CLIENTE CONSULTA ORDEN AJENA (RECHAZADO)',
        async () => {

            // el usuario 3 es Ana, la que se registró antes.
            await ordenService.obtenerOrden(
                3,
                ordenId,
            );
        },
    );


    await escenario(
        '20. CLIENTE INTENTA CAMBIAR ESTADO (RECHAZADO)',
        async () => {

            await ordenService.cambiarEstadoOrden(
                CLIENTE,
                ordenId,
                EstadoOrden.PROCESANDO,
            );
        },
    );


    await escenario(
        '21. ADMIN INTENTA PROCESAR SIN PAGO (RECHAZADO)',
        async () => {

            await ordenService.cambiarEstadoOrden(
                ADMIN,
                ordenId,
                EstadoOrden.PROCESANDO,
            );
        },
    );


    await escenario(
        '22. CLIENTE PAGA SU ORDEN',
        async () => {

            const pago =
                await ordenService.pagarOrden(
                    CLIENTE,
                    ordenId,
                );

            console.log(
                'Pago:',
                pago.estado,
            );
        },
    );


    await escenario(
        '23. PAGAR DOS VECES (RECHAZADO)',
        async () => {

            await ordenService.pagarOrden(
                CLIENTE,
                ordenId,
            );
        },
    );


    await escenario(
        '24. ADMIN PROCESA LA ORDEN',
        async () => {

            const orden =
                await ordenService.cambiarEstadoOrden(
                    ADMIN,
                    ordenId,
                    EstadoOrden.PROCESANDO,
                );

            console.log(
                'Estado:',
                orden.estado,
            );
        },
    );


    await escenario(
        '25. INTENTO DE SALTAR UN ESTADO (RECHAZADO)',
        async () => {

            await ordenService.cambiarEstadoOrden(
                ADMIN,
                ordenId,
                EstadoOrden.ENTREGADO,
            );
        },
    );


    await escenario(
        '26. REGISTRAR ENVÍO, ENVIAR Y ENTREGAR',
        async () => {

            const envio =
                await ordenService.registrarEnvio(
                    ADMIN,
                    ordenId,
                    'Paquetería de prueba',
                    'GUIA-001',
                );

            console.log(
                'Paquetería:',
                envio.nombrePaqueteria,
                '- Guía:',
                envio.numeroGuia,
            );

            await ordenService.cambiarEstadoOrden(
                ADMIN,
                ordenId,
                EstadoOrden.ENVIADO,
            );

            await ordenService.cambiarEstadoOrden(
                ADMIN,
                ordenId,
                EstadoOrden.ENTREGADO,
            );

            const completa =
                await ordenService.obtenerOrden(
                    CLIENTE,
                    ordenId,
                );

            console.log(
                'Estado final:',
                completa.orden.estado,
            );

            console.log(
                'Fecha de entrega:',
                completa.envio?.fechaEntrega,
            );
        },
    );


    // --- la ultima unidad: dos clientes, un solo producto ---

    await escenario(
        '27. DOS CLIENTES QUIEREN LA ÚLTIMA UNIDAD (SOLO SE CONFIRMA LA PRIMERA)',
        async () => {

            // la sudadera tiene 3 en stock. los dos la agregan al carrito
            // porque en ese momento si alcanza para cada uno.
            await carritoService.agregar(
                CLIENTE,
                2,
                3,
            );

            await carritoService.agregar(
                3,
                2,
                3,
            );

            await ordenService.confirmarCompra(
                CLIENTE,
                1,
                MetodoPago.EFECTIVO,
            );

            console.log(
                'Primera compra confirmada.',
            );

            // la direccion 2 es la de Ana.
            await ordenService.confirmarCompra(
                3,
                2,
                MetodoPago.EFECTIVO,
            );
        },
    );


    // --- inventario y dashboard ---

    await escenario(
        '28. CLIENTE INTENTA AJUSTAR INVENTARIO (RECHAZADO)',
        async () => {

            await inventarioService.ajustarInventario(
                CLIENTE,
                2,
                2,
                Motivo.ENTRADA,
            );
        },
    );


    await escenario(
        '29. ADMIN AJUSTA INVENTARIO',
        async () => {

            const ajuste =
                await inventarioService.ajustarInventario(
                    ADMIN,
                    2,
                    2,
                    Motivo.ENTRADA,
                );

            console.log(
                'Ajuste:',
                ajuste.cantidad,
                '-',
                ajuste.motivo,
                '- hecho por el usuario',
                ajuste.usuarioId,
            );
        },
    );


    await escenario(
        '30. AJUSTE QUE DEJARÍA STOCK NEGATIVO (RECHAZADO)',
        async () => {

            await inventarioService.ajustarInventario(
                ADMIN,
                2,
                -100,
                Motivo.CORRECCION,
            );
        },
    );


    await escenario(
        '31. VARIANTES CON STOCK BAJO',
        async () => {

            const variantes =
                await inventarioService.listarVariantes(
                    ADMIN,
                    true,
                );

            console.log(
                'Variantes con stock bajo:',
                variantes,
            );
        },
    );


    await escenario(
        '32. DASHBOARD DEL ADMIN',
        async () => {

            const resumen =
                await dashboardService.obtenerResumen(
                    ADMIN,
                );

            console.log(
                'Órdenes de hoy:',
                resumen.ordenesHoy,
            );

            console.log(
                'Ventas del periodo:',
                resumen.ventasTotales,
            );

            console.log(
                'Más vendidos:',
                resumen.masVendidos,
            );
        },
    );


    await escenario(
        '33. CLIENTE INTENTA VER EL DASHBOARD (RECHAZADO)',
        async () => {

            await dashboardService.obtenerResumen(
                CLIENTE,
            );
        },
    );


    console.log(
        '\n=== FIN DE PRUEBAS ===\n',
    );
}


ejecutar();
