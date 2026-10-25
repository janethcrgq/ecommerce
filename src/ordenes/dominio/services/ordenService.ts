import { DetalleOrden } from '../entidades/detalleOrden';
import { Envio } from '../entidades/envio';
import { Orden } from '../entidades/orden';
import { Pago } from '../entidades/pago';

import { EstadoOrden } from '../enums/estadoOrdenEnum';
import { EstadoPago } from '../enums/estadoPagoEnum';
import { MetodoPago } from '../enums/metodoPagoEnum';

import {
    EnvioNoEncontradoError,
    EnvioPendienteError,
    EnvioYaRegistradoError,
    OrdenAjenaError,
    OrdenNoEncontradaError,
    PagoNoEncontradoError,
    PagoPendienteError,
    PagoYaRealizadoError,
    TransicionEstadoInvalidaError,
} from '../errores/ordenesErrores';

import { IEnvioRepository } from '../repositories/iEnvioRepository';
import {
    FiltrosOrden,
    IOrdenRepository,
} from '../repositories/IOrdenRepository';
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
    UsuarioNoEncontradoError,
} from '../../../usuarios/dominio/errores/usuarioErrores';

import { validarAdministrador } from '../../../usuarios/dominio/reglas/validarAdministrador';

import { IDireccionRepository } from '../../../usuarios/dominio/repositories/iDireccionRepository';
import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


// una orden completa: sus productos, su pago y su envio (si ya tiene).
export interface OrdenDetalle {
    orden: Orden;
    detalles: DetalleOrden[];
    pago: Pago | null;
    envio: Envio | null;
}


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


        // la direccion tiene que ser del mismo usuario que compra.
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

        let total = 0;


        // Se vuelve a comprobar cada producto antes de confirmar.
        // porque desde que se agrego al carrito pudo cambiar el stock.
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


            // el precio se guarda en la orden tal como estaba hoy,
            // aunque despues el producto cambie de precio.
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
        }


        // el repositorio descuenta el stock, guarda la orden con su pago
        // y vacia el carrito todo junto. si alguien mas compro la ultima
        // unidad, aqui es donde se rechaza.
        return this.ordenRepo.confirmarCompra({
            orden: {
                id: 0,
                usuarioId,
                direccionId,
                fecha: new Date(),
                total,
                // Todas las órdenes comienzan como pendientes.
                estado:
                    EstadoOrden.PENDIENTE,
            },
            detalles,
            // Toda orden genera un registro de pago.
            pago: {
                id: 0,
                ordenId: 0,
                metodo:
                    metodoPago,
                estado:
                    EstadoPago.PENDIENTE,
                monto:
                    total,
            },
            carritoId:
                carrito.id,
        });
    }


    // el cliente solo ve sus ordenes, el admin ve cualquiera.
    async obtenerOrden(
        usuarioId: number,
        ordenId: number,
    ): Promise<OrdenDetalle> {

        const orden =
            await this.obtenerOrdenConAcceso(
                usuarioId,
                ordenId,
            );

        const detalles =
            await this.ordenRepo.obtenerDetalles(
                orden.id,
            );

        const pago =
            await this.pagoRepo.obtenerPorOrden(
                orden.id,
            );

        const envio =
            await this.envioRepo.obtenerPorOrden(
                orden.id,
            );

        return {
            orden,
            detalles,
            pago,
            envio,
        };
    }


    // el cliente solo recibe sus propias ordenes aunque pida otro usuario.
    // el admin puede filtrar por estado, fecha y cliente.
    async listarOrdenes(
        usuarioId: number,
        filtros: FiltrosOrden = {},
    ): Promise<Orden[]> {

        const usuario =
            await this.usuarioRepo.obtenerPorId(
                usuarioId,
            );

        if (!usuario) {
            throw new UsuarioNoEncontradoError();
        }

        if (usuario.rol === RolUsuario.ADMINISTRADOR) {
            return this.ordenRepo.listar(
                filtros,
            );
        }

        return this.ordenRepo.listar({
            ...filtros,
            usuarioId,
        });
    }


    // el cliente paga su orden. no hay tarjeta real, solo se marca como pagada.
    async pagarOrden(
        usuarioId: number,
        ordenId: number,
    ): Promise<Pago> {

        const orden =
            await this.obtenerOrdenConAcceso(
                usuarioId,
                ordenId,
            );

        const pago =
            await this.pagoRepo.obtenerPorOrden(
                orden.id,
            );

        if (!pago) {
            throw new PagoNoEncontradoError();
        }

        if (pago.estado === EstadoPago.PAGADO) {
            throw new PagoYaRealizadoError();
        }

        pago.estado =
            EstadoPago.PAGADO;

        const actualizado =
            await this.pagoRepo.actualizar(
                pago,
            );

        return actualizado!;
    }


    // Simula la confirmación o rechazo del pago.
    // el admin puede poner el pago en cualquier estado
    // (por ejemplo confirmar una transferencia o marcarlo como fallido).
    async cambiarEstadoPago(
        usuarioId: number,
        ordenId: number,
        nuevoEstado: EstadoPago,
    ): Promise<Pago> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'cambiar el estado de un pago',
        );


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

        await validarAdministrador(
            this.usuarioRepo,
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


        // los estados van en orden y no se puede saltar ninguno.
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


        // PENDIENTE -> PROCESANDO
        // únicamente cuando el pago está confirmado.
        if (
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


        // PROCESANDO -> ENVIADO
        // requiere que ya exista guía y paquetería.
        // enviado -> entregado: tambien usamos el envio para guardar la fecha.
        const envio =
            await this.envioRepo.obtenerPorOrden(
                orden.id,
            );

        if (
            (
                nuevoEstado ===
                EstadoOrden.ENVIADO ||
                nuevoEstado ===
                EstadoOrden.ENTREGADO
            ) &&
            !envio
        ) {
            throw new EnvioPendienteError();
        }


        orden.estado =
            nuevoEstado;


        const actualizada =
            await this.ordenRepo.actualizar(
                orden,
            );


        // Al entregar la orden se registra
        // también la fecha de entrega.
        if (
            nuevoEstado ===
            EstadoOrden.ENTREGADO
        ) {

            envio!.fechaEntrega =
                new Date();


            await this.envioRepo.actualizar(
                envio!,
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

        await validarAdministrador(
            this.usuarioRepo,
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
        usuarioId: number,
        ordenId: number,
    ): Promise<Envio> {

        const orden =
            await this.obtenerOrdenConAcceso(
                usuarioId,
                ordenId,
            );

        const envio =
            await this.envioRepo.obtenerPorOrden(
                orden.id,
            );

        if (!envio) {
            throw new EnvioNoEncontradoError();
        }

        return envio;
    }


    // busca la orden y revisa que sea del usuario que la pide.
    // el admin puede ver cualquier orden.
    private async obtenerOrdenConAcceso(
        usuarioId: number,
        ordenId: number,
    ): Promise<Orden> {

        const usuario =
            await this.usuarioRepo.obtenerPorId(
                usuarioId,
            );

        if (!usuario) {
            throw new UsuarioNoEncontradoError();
        }


        const orden =
            await this.ordenRepo.obtenerPorId(
                ordenId,
            );

        if (!orden) {
            throw new OrdenNoEncontradaError();
        }


        if (
            usuario.rol !==
            RolUsuario.ADMINISTRADOR &&
            orden.usuarioId !== usuarioId
        ) {
            throw new OrdenAjenaError();
        }


        return orden;
    }
}
