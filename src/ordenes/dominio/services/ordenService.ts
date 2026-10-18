import { DetalleOrden } from '../entidades/detalleOrden';
import { Envio } from '../entidades/envio';
import { Orden } from '../entidades/orden';
import { Pago } from '../entidades/pago';

import { EstadoOrden } from '../enums/estadoOrdenEnum';
import { EstadoPago } from '../enums/estadoPagoEnum';
import { MetodoPago } from '../enums/metodoPagoEnum';

import {
    EnvioNoEncontradoError,
    EnvioYaRegistradoError,
    OrdenNoEncontradaError,
    PagoNoEncontradoError,
    PagoPendienteError,
    TransicionEstadoInvalidaError,
} from '../errores/ordenesErrores';

import { IEnvioRepository } from '../repositories/iEnvioRepository';
import { IOrdenRepository } from '../repositories/IOrdenRepository';
import { IPagoRepository } from '../repositories/iPagoRepository';

import {
    CarritoVacioError,
    ProductoInactivoError,
} from '../../../carrito/dominio/errores/carritoErrores';

import { ICarritoRepository } from '../../../carrito/dominio/repositories/iCarritoRepository';

import {
    ProductoNoEncontradoError,
    StockInsuficienteError,
    VarianteNoEncontradaError,
} from '../../../catalogo/dominio/errores/catalogoErrores';

import { IProductosRepository } from '../../../catalogo/dominio/repositories/iProductoRepository';
import { IVarianteProductoRepository } from '../../../catalogo/dominio/repositories/iVarianteProductoRepository';

import { RolUsuario } from '../../../usuarios/dominio/enums/rolUsuarioEnum';

import {
    DireccionNoEncontradaError,
    DireccionNoPerteneceAlUsuarioError,
    PermisoDenegadoError,
    UsuarioNoEncontradoError,
} from '../../../usuarios/dominio/errores/usuarioErrores';

import { IDireccionRepository } from '../../../usuarios/dominio/repositories/iDireccionRepository';
import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


export class OrdenService {

    constructor(
        private readonly ordenRepo:
            IOrdenRepository,

        private readonly carritoRepo:
            ICarritoRepository,

        private readonly productoRepo:
            IProductosRepository,

        private readonly varianteRepo:
            IVarianteProductoRepository,

        private readonly usuarioRepo:
            IUsuarioRepository,

        private readonly direccionRepo:
            IDireccionRepository,

        private readonly pagoRepo:
            IPagoRepository,

        private readonly envioRepo:
            IEnvioRepository,
    ) { }


    // Convierte el carrito actual en una orden.
    async confirmarCompra(
        usuarioId: number,
        direccionId: number,
        metodoPago: MetodoPago,
    ): Promise<{
        orden: Orden;
        pago: Pago;
    }> {

        const usuario =
            await this.usuarioRepo.obtenerPorId(
                usuarioId,
            );

        if (!usuario) {
            throw new UsuarioNoEncontradoError();
        }


        const direccion =
            await this.direccionRepo.obtenerPorId(
                direccionId,
            );

        if (!direccion) {
            throw new DireccionNoEncontradaError();
        }


        if (
            direccion.usuarioId !== usuarioId
        ) {
            throw new DireccionNoPerteneceAlUsuarioError();
        }


        const carrito =
            await this.carritoRepo.obtenerPorUsuario(
                usuarioId,
            );

        if (!carrito) {
            throw new CarritoVacioError();
        }


        const items =
            await this.carritoRepo.listarItems(
                carrito.id,
            );

        if (items.length === 0) {
            throw new CarritoVacioError();
        }


        const detalles:
            DetalleOrden[] = [];

        const descuentoStock: {
            varianteId: number;
            cantidad: number;
        }[] = [];

        let total = 0;


        // Se vuelve a comprobar cada producto antes de confirmar.
        for (const item of items) {

            const variante =
                await this.varianteRepo.obtenerPorId(
                    item.varianteId,
                );

            if (!variante) {
                throw new VarianteNoEncontradaError(
                    item.varianteId,
                );
            }


            const producto =
                await this.productoRepo.obtenerPorId(
                    variante.productoId,
                );

            if (!producto) {
                throw new ProductoNoEncontradoError(
                    variante.productoId,
                );
            }


            if (!producto.activo) {
                throw new ProductoInactivoError();
            }


            if (
                item.cantidad >
                variante.stock
            ) {
                throw new StockInsuficienteError(
                    item.cantidad,
                    variante.stock,
                );
            }


            const subtotal =
                producto.precio *
                item.cantidad;


            total += subtotal;


            detalles.push({
                id: 0,
                ordenId: 0,
                varianteId:
                    variante.id,
                cantidad:
                    item.cantidad,
                precioUnitario:
                    producto.precio,
                subtotal,
            });


            descuentoStock.push({
                varianteId:
                    variante.id,
                cantidad:
                    item.cantidad,
            });
        }


        /*
         * En memoria se ejecuta después de validar todos los items.
         * Cuando lleguemos a MySQL esta operación formará parte
         * de una transacción junto con la creación de la orden.
         */
        await this.varianteRepo.descontarStock(
            descuentoStock,
        );


        // Todas las órdenes comienzan como pendientes.
        const orden =
            await this.ordenRepo.guardar(
                {
                    id: 0,
                    usuarioId,
                    direccionId,
                    fecha: new Date(),
                    total,
                    estado:
                        EstadoOrden.PENDIENTE,
                },
                detalles,
            );


        // Toda orden genera un registro de pago.
        const pago =
            await this.pagoRepo.guardar({
                id: 0,
                ordenId:
                    orden.id,
                metodo:
                    metodoPago,
                estado:
                    EstadoPago.PENDIENTE,
                monto:
                    total,
            });


        // Después de generar la compra se limpia el carrito.
        await this.carritoRepo.vaciar(
            carrito.id,
        );


        return {
            orden,
            pago,
        };
    }


    async obtenerOrden(
        ordenId: number,
    ): Promise<Orden> {

        const orden =
            await this.ordenRepo.obtenerPorId(
                ordenId,
            );

        if (!orden) {
            throw new OrdenNoEncontradaError();
        }

        return orden;
    }


    async listarOrdenesUsuario(
        usuarioId: number,
    ): Promise<Orden[]> {

        return this.ordenRepo.listar({
            usuarioId,
        });
    }


    // Simula la confirmación o rechazo del pago.
    // Posteriormente quedará expuesto mediante el servicio HTTP.
    async cambiarEstadoPago(
        ordenId: number,
        nuevoEstado: EstadoPago,
    ): Promise<Pago> {

        const orden =
            await this.ordenRepo.obtenerPorId(
                ordenId,
            );

        if (!orden) {
            throw new OrdenNoEncontradaError();
        }


        const pago =
            await this.pagoRepo.obtenerPorOrden(
                ordenId,
            );

        if (!pago) {
            throw new PagoNoEncontradoError();
        }


        pago.estado =
            nuevoEstado;


        const actualizado =
            await this.pagoRepo.actualizar(
                pago,
            );

        return actualizado!;
    }


    // Solamente un administrador puede cambiar
    // el estado de una orden.
    async cambiarEstadoOrden(
        usuarioId: number,
        ordenId: number,
        nuevoEstado: EstadoOrden,
    ): Promise<Orden> {

        await this.validarAdministrador(
            usuarioId,
            'cambiar el estado de una orden',
        );


        const orden =
            await this.ordenRepo.obtenerPorId(
                ordenId,
            );

        if (!orden) {
            throw new OrdenNoEncontradaError();
        }


        /*
         * PENDIENTE -> PROCESANDO
         * únicamente cuando el pago está confirmado.
         */
        if (
            orden.estado ===
            EstadoOrden.PENDIENTE &&
            nuevoEstado ===
            EstadoOrden.PROCESANDO
        ) {

            const pago =
                await this.pagoRepo.obtenerPorOrden(
                    orden.id,
                );

            if (
                !pago ||
                pago.estado !==
                EstadoPago.PAGADO
            ) {
                throw new PagoPendienteError();
            }
        }


        /*
         * PROCESANDO -> ENVIADO
         * requiere que ya exista guía y paquetería.
         */
        if (
            orden.estado ===
            EstadoOrden.PROCESANDO &&
            nuevoEstado ===
            EstadoOrden.ENVIADO
        ) {

            const envio =
                await this.envioRepo.obtenerPorOrden(
                    orden.id,
                );

            if (!envio) {
                throw new EnvioNoEncontradoError();
            }
        }


        const siguienteEstado:
            Partial<
                Record<
                    EstadoOrden,
                    EstadoOrden
                >
            > = {

            [EstadoOrden.PENDIENTE]:
                EstadoOrden.PROCESANDO,

            [EstadoOrden.PROCESANDO]:
                EstadoOrden.ENVIADO,

            [EstadoOrden.ENVIADO]:
                EstadoOrden.ENTREGADO,
        };


        if (
            siguienteEstado[orden.estado] !==
            nuevoEstado
        ) {
            throw new TransicionEstadoInvalidaError(
                orden.estado,
                nuevoEstado,
            );
        }


        orden.estado =
            nuevoEstado;


        const actualizada =
            await this.ordenRepo.actualizar(
                orden,
            );


        /*
         * Al entregar la orden se registra
         * también la fecha de entrega.
         */
        if (
            nuevoEstado ===
            EstadoOrden.ENTREGADO
        ) {

            const envio =
                await this.envioRepo.obtenerPorOrden(
                    orden.id,
                );

            if (!envio) {
                throw new EnvioNoEncontradoError();
            }


            envio.fechaEntrega =
                new Date();


            await this.envioRepo.actualizar(
                envio,
            );
        }


        return actualizada!;
    }


    // Registra paquetería y guía antes de marcar
    // una orden como enviada.
    async registrarEnvio(
        usuarioId: number,
        ordenId: number,
        nombrePaqueteria: string,
        numeroGuia: string,
    ): Promise<Envio> {

        await this.validarAdministrador(
            usuarioId,
            'registrar un envío',
        );


        const orden =
            await this.ordenRepo.obtenerPorId(
                ordenId,
            );

        if (!orden) {
            throw new OrdenNoEncontradaError();
        }


        if (
            orden.estado !==
            EstadoOrden.PROCESANDO
        ) {
            throw new TransicionEstadoInvalidaError(
                orden.estado,
                EstadoOrden.ENVIADO,
            );
        }


        const existente =
            await this.envioRepo.obtenerPorOrden(
                ordenId,
            );

        if (existente) {
            throw new EnvioYaRegistradoError();
        }


        return this.envioRepo.guardar({
            id: 0,
            ordenId,
            nombrePaqueteria,
            numeroGuia,
            fechaEnvio:
                new Date(),
            fechaEntrega:
                null,
        });
    }


    async consultarEnvio(
        ordenId: number,
    ): Promise<Envio> {

        const envio =
            await this.envioRepo.obtenerPorOrden(
                ordenId,
            );

        if (!envio) {
            throw new EnvioNoEncontradoError();
        }

        return envio;
    }


    private async validarAdministrador(
        usuarioId: number,
        accion: string,
    ): Promise<void> {

        const usuario =
            await this.usuarioRepo.obtenerPorId(
                usuarioId,
            );

        if (!usuario) {
            throw new UsuarioNoEncontradoError();
        }


        if (
            usuario.rol !==
            RolUsuario.ADMINISTRADOR
        ) {
            throw new PermisoDenegadoError(
                accion,
            );
        }
    }
}