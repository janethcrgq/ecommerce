import { CarritoService } from './carrito/dominio/services/carritoService';

import { CatalogoService } from './catalogo/dominio/services/catalogoService';

import { InventarioService } from './inventario/dominio/services/inventarioService';

import { Motivo } from './inventario/dominio/enums/motivoEnum';

import { OrdenService } from './ordenes/dominio/services/ordenService';

import { EstadoOrden } from './ordenes/dominio/enums/estadoOrdenEnum';

import { EstadoPago } from './ordenes/dominio/enums/estadoPagoEnum';

import { MetodoPago } from './ordenes/dominio/enums/metodoPagoEnum';

import { ErrorDominio } from './compartido/errorDominio';

import { AjusteInventarioMemoriaRepository } from './infra/memoria/ajusteInventarioMemoriaRepository';

import { CarritoMemoriaRepository } from './infra/memoria/carritoMemoriaRepository';

import { DireccionMemoriaRepository } from './infra/memoria/direccionMemoriaRepository';

import { EnvioMemoriaRepository } from './infra/memoria/envioMemoriaRepository';

import { OrdenMemoriaRepository } from './infra/memoria/ordenMemoriaRepository';

import { PagoMemoriaRepository } from './infra/memoria/pagoMemoriaRepository';

import { ProductoMemoriaRepository } from './infra/memoria/productoMemoriaRepository';

import { UsuarioMemoriaRepository } from './infra/memoria/usuarioMemoriaRepository';

import { VarianteProductoMemoriaRepository } from './infra/memoria/varianteProductoMemoriaRepository';


// Repositorios en memoria.
// Después estos mismos contratos serán implementados con MySQL.
const productoRepo =
    new ProductoMemoriaRepository();

const varianteRepo =
    new VarianteProductoMemoriaRepository();

const usuarioRepo =
    new UsuarioMemoriaRepository();

const carritoRepo =
    new CarritoMemoriaRepository();

const ordenRepo =
    new OrdenMemoriaRepository();

const direccionRepo =
    new DireccionMemoriaRepository();

const pagoRepo =
    new PagoMemoriaRepository();

const envioRepo =
    new EnvioMemoriaRepository();

const ajusteRepo =
    new AjusteInventarioMemoriaRepository();


// Servicios del dominio modular.
const catalogoService =
    new CatalogoService(
        productoRepo,
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


function mostrarError(
    error: unknown,
): void {

    if (
        error instanceof ErrorDominio
    ) {
        console.log(
            `ERROR DE DOMINIO: ${error.message}`,
        );

        return;
    }

    console.error(error);
}


async function ejecutar(): Promise<void> {

    console.log(
        '\n=== PRUEBAS DEL DOMINIO ===',
    );


    console.log(
        '\n=== 1. CATÁLOGO ===',
    );

    const catalogo =
        await catalogoService.listarDisponibles();

    console.log(
        'Productos disponibles:',
        catalogo.map(
            (producto) =>
                producto.nombre,
        ),
    );


    console.log(
        '\n=== 2. CLIENTE INTENTA MODIFICAR CATÁLOGO ===',
    );

    try {

        await catalogoService.registrarProducto(
            1,
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

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 3. ADMIN INTENTA PRECIO INVÁLIDO ===',
    );

    try {

        await catalogoService.registrarProducto(
            2,
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

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 4. AGREGAR PRODUCTO AL CARRITO ===',
    );

    try {

        const item =
            await carritoService.agregar(
                1,
                1,
                2,
            );

        console.log(
            'Producto agregado correctamente.',
        );

        console.log(
            'Cantidad:',
            item.cantidad,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 5. STOCK INSUFICIENTE ===',
    );

    try {

        await carritoService.agregar(
            1,
            2,
            5,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 6. PRODUCTO INACTIVO ===',
    );

    try {

        await carritoService.agregar(
            1,
            3,
            1,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 7. CONFIRMAR COMPRA ===',
    );

    try {

        const resultado =
            await ordenService.confirmarCompra(
                1,
                1,
                MetodoPago.TARJETA,
            );


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


        console.log(
            '\n=== 8. CLIENTE INTENTA CAMBIAR ESTADO ===',
        );

        try {

            await ordenService.cambiarEstadoOrden(
                1,
                resultado.orden.id,
                EstadoOrden.PROCESANDO,
            );

        } catch (error) {
            mostrarError(error);
        }


        console.log(
            '\n=== 9. ADMIN INTENTA PROCESAR SIN PAGO ===',
        );

        try {

            await ordenService.cambiarEstadoOrden(
                2,
                resultado.orden.id,
                EstadoOrden.PROCESANDO,
            );

        } catch (error) {
            mostrarError(error);
        }


        console.log(
            '\n=== 10. CONFIRMAR PAGO ===',
        );

        const pago =
            await ordenService.cambiarEstadoPago(
                resultado.orden.id,
                EstadoPago.PAGADO,
            );

        console.log(
            'Pago:',
            pago.estado,
        );


        console.log(
            '\n=== 11. ORDEN EN PROCESO ===',
        );

        const procesando =
            await ordenService.cambiarEstadoOrden(
                2,
                resultado.orden.id,
                EstadoOrden.PROCESANDO,
            );

        console.log(
            'Estado:',
            procesando.estado,
        );


        console.log(
            '\n=== 12. INTENTO DE SALTAR ESTADO ===',
        );

        try {

            await ordenService.cambiarEstadoOrden(
                2,
                resultado.orden.id,
                EstadoOrden.ENTREGADO,
            );

        } catch (error) {
            mostrarError(error);
        }


        console.log(
            '\n=== 13. REGISTRAR ENVÍO ===',
        );

        const envio =
            await ordenService.registrarEnvio(
                2,
                resultado.orden.id,
                'Paquetería de prueba',
                'GUIA-001',
            );

        console.log(
            'Paquetería:',
            envio.nombrePaqueteria,
        );

        console.log(
            'Guía:',
            envio.numeroGuia,
        );


        console.log(
            '\n=== 14. ORDEN ENVIADA ===',
        );

        const enviada =
            await ordenService.cambiarEstadoOrden(
                2,
                resultado.orden.id,
                EstadoOrden.ENVIADO,
            );

        console.log(
            'Estado:',
            enviada.estado,
        );


        console.log(
            '\n=== 15. ORDEN ENTREGADA ===',
        );

        const entregada =
            await ordenService.cambiarEstadoOrden(
                2,
                resultado.orden.id,
                EstadoOrden.ENTREGADO,
            );

        console.log(
            'Estado:',
            entregada.estado,
        );


        const envioFinal =
            await ordenService.consultarEnvio(
                resultado.orden.id,
            );

        console.log(
            'Fecha de entrega:',
            envioFinal.fechaEntrega,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 16. CLIENTE INTENTA AJUSTAR INVENTARIO ===',
    );

    try {

        await inventarioService.ajustarInventario(
            1,
            2,
            2,
            Motivo.ENTRADA,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 17. ADMIN AJUSTA INVENTARIO ===',
    );

    try {

        const ajuste =
            await inventarioService.ajustarInventario(
                2,
                2,
                2,
                Motivo.ENTRADA,
            );

        console.log(
            'Ajuste realizado correctamente.',
        );

        console.log(
            'Cantidad:',
            ajuste.cantidad,
        );

        console.log(
            'Motivo:',
            ajuste.motivo,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== 18. AJUSTE QUE DEJARÍA STOCK NEGATIVO ===',
    );

    try {

        await inventarioService.ajustarInventario(
            2,
            2,
            -100,
            Motivo.CORRECCION,
        );

    } catch (error) {
        mostrarError(error);
    }


    console.log(
        '\n=== FIN DE PRUEBAS ===\n',
    );
}


ejecutar();