import { DetalleOrden } from '../../ordenes/dominio/entidades/detalleOrden';
import { Orden } from '../../ordenes/dominio/entidades/orden';
import { Pago } from '../../ordenes/dominio/entidades/pago';

import {
    DatosCompra,
    FiltrosOrden,
    IOrdenRepository,
} from '../../ordenes/dominio/repositories/IOrdenRepository';

import { IPagoRepository } from '../../ordenes/dominio/repositories/iPagoRepository';

import { ICarritoRepository } from '../../carrito/dominio/repositories/iCarritoRepository';

import { IVarianteProductoRepository } from '../../catalogo/dominio/repositories/iVarianteProductoRepository';


export class OrdenMemoriaRepository
    implements IOrdenRepository {

    private readonly ordenes: Orden[] = [];

    private readonly detalles:
        DetalleOrden[] = [];

    private siguienteOrdenId = 1;

    private siguienteDetalleId = 1;


    // para confirmar una compra en memoria necesita tocar el stock,
    // el pago y el carrito, por eso recibe esos repositorios.
    constructor(
        private readonly varianteRepo:
            IVarianteProductoRepository,

        private readonly pagoRepo:
            IPagoRepository,

        private readonly carritoRepo:
            ICarritoRepository,
    ) { }


    async confirmarCompra(
        datos: DatosCompra,
    ): Promise<{
        orden: Orden;
        pago: Pago;
    }> {

        // primero se descuenta el stock de todo junto.
        // si algun producto ya no alcanza, lanza error y no se guarda nada.
        await this.varianteRepo.descontarStock(
            datos.detalles.map(
                (detalle) => ({
                    varianteId:
                        detalle.varianteId,
                    cantidad:
                        detalle.cantidad,
                }),
            ),
        );


        const orden =
            await this.guardar(
                datos.orden,
                datos.detalles,
            );


        const pago =
            await this.pagoRepo.guardar({
                ...datos.pago,
                ordenId:
                    orden.id,
            });


        await this.carritoRepo.vaciar(
            datos.carritoId,
        );


        return {
            orden,
            pago,
        };
    }


    async guardar(
        orden: Orden,
        detalles: DetalleOrden[],
    ): Promise<Orden> {

        const nuevaOrden: Orden = {
            ...orden,
            id:
                orden.id ||
                this.siguienteOrdenId++,
        };


        this.ordenes.push({
            ...nuevaOrden,
        });


        for (const detalle of detalles) {

            const nuevoDetalle:
                DetalleOrden = {
                ...detalle,

                id:
                    detalle.id ||
                    this.siguienteDetalleId++,

                ordenId:
                    nuevaOrden.id,
            };


            this.detalles.push({
                ...nuevoDetalle,
            });
        }


        return {
            ...nuevaOrden,
        };
    }


    async obtenerPorId(
        id: number,
    ): Promise<Orden | null> {

        const orden =
            this.ordenes.find(
                (actual) =>
                    actual.id === id,
            );

        return orden
            ? { ...orden }
            : null;
    }


    async listar(
        filtros?: FiltrosOrden,
    ): Promise<Orden[]> {

        let resultado =
            [...this.ordenes];


        if (
            filtros?.usuarioId !==
            undefined
        ) {
            resultado =
                resultado.filter(
                    (orden) =>
                        orden.usuarioId ===
                        filtros.usuarioId,
                );
        }


        if (
            filtros?.estado !==
            undefined
        ) {
            resultado =
                resultado.filter(
                    (orden) =>
                        orden.estado ===
                        filtros.estado,
                );
        }


        if (filtros?.fechaDesde) {

            resultado =
                resultado.filter(
                    (orden) =>
                        orden.fecha >=
                        filtros.fechaDesde!,
                );
        }


        if (filtros?.fechaHasta) {

            resultado =
                resultado.filter(
                    (orden) =>
                        orden.fecha <=
                        filtros.fechaHasta!,
                );
        }


        return resultado.map(
            (orden) => ({
                ...orden,
            }),
        );
    }


    async obtenerDetalles(
        ordenId: number,
    ): Promise<DetalleOrden[]> {

        return this.detalles
            .filter(
                (detalle) =>
                    detalle.ordenId ===
                    ordenId,
            )
            .map(
                (detalle) => ({
                    ...detalle,
                }),
            );
    }


    async actualizar(
        orden: Orden,
    ): Promise<Orden | null> {

        const indice =
            this.ordenes.findIndex(
                (actual) =>
                    actual.id === orden.id,
            );

        if (indice === -1) {
            return null;
        }


        this.ordenes[indice] = {
            ...orden,
        };


        return {
            ...orden,
        };
    }
}