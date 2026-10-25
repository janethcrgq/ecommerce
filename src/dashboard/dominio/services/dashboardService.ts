import { VarianteProducto } from '../../../catalogo/dominio/entidades/varianteProducto';

import { IProductosRepository } from '../../../catalogo/dominio/repositories/iProductoRepository';

import { IVarianteProductoRepository } from '../../../catalogo/dominio/repositories/iVarianteProductoRepository';

import { IOrdenRepository } from '../../../ordenes/dominio/repositories/IOrdenRepository';

import { validarAdministrador } from '../../../usuarios/dominio/reglas/validarAdministrador';

import { IUsuarioRepository } from '../../../usuarios/dominio/repositories/iUsuarioRepository';


export interface ProductoMasVendido {
    productoId: number;
    nombre: string;
    unidadesVendidas: number;
}


export interface ResumenDashboard {
    ordenesHoy: number;
    ventasTotales: number;
    desde: Date;
    hasta: Date;
    variantesStockBajo: VarianteProducto[];
    masVendidos: ProductoMasVendido[];
}


// cuantos dias se toman si el admin no escoge un periodo.
const DIAS_POR_DEFECTO = 30;

const CANTIDAD_MAS_VENDIDOS = 5;


export class DashboardService {

    constructor(
        private readonly ordenRepo:
            IOrdenRepository,

        private readonly varianteRepo:
            IVarianteProductoRepository,

        private readonly productoRepo:
            IProductosRepository,

        private readonly usuarioRepo:
            IUsuarioRepository,
    ) { }


    // el resumen solo lo ve el administrador.
    async obtenerResumen(
        usuarioId: number,
        desde?: Date,
        hasta?: Date,
    ): Promise<ResumenDashboard> {

        await validarAdministrador(
            this.usuarioRepo,
            usuarioId,
            'ver el resumen de la tienda',
        );


        const ahora =
            new Date();

        const fin =
            hasta ?? ahora;

        const inicio =
            desde ?? new Date(
                ahora.getTime() -
                DIAS_POR_DEFECTO *
                24 * 60 * 60 * 1000,
            );


        // ordenes de hoy: desde las 00:00 hasta ahorita.
        const inicioHoy =
            new Date(ahora);

        inicioHoy.setHours(0, 0, 0, 0);

        const ordenesHoy =
            await this.ordenRepo.listar({
                fechaDesde: inicioHoy,
            });


        // ventas del periodo: suma del total de sus ordenes.
        const ordenesPeriodo =
            await this.ordenRepo.listar({
                fechaDesde: inicio,
                fechaHasta: fin,
            });

        const ventasTotales =
            ordenesPeriodo.reduce(
                (suma, orden) =>
                    suma + orden.total,
                0,
            );


        // stock bajo: variantes en o debajo de su minimo.
        const variantes =
            await this.varianteRepo.listar();

        const variantesStockBajo =
            variantes.filter(
                (variante) =>
                    variante.stock <=
                    variante.stockMinimo,
            );


        const masVendidos =
            await this.calcularMasVendidos(
                ordenesPeriodo.map(
                    (orden) => orden.id,
                ),
            );


        return {
            ordenesHoy:
                ordenesHoy.length,
            ventasTotales,
            desde: inicio,
            hasta: fin,
            variantesStockBajo,
            masVendidos,
        };
    }


    // suma las unidades vendidas de cada producto
    // y se queda con los que mas salieron.
    private async calcularMasVendidos(
        ordenesIds: number[],
    ): Promise<ProductoMasVendido[]> {

        const unidadesPorProducto =
            new Map<number, number>();

        for (const ordenId of ordenesIds) {

            const detalles =
                await this.ordenRepo.obtenerDetalles(
                    ordenId,
                );

            for (const detalle of detalles) {

                const variante =
                    await this.varianteRepo.obtenerPorId(
                        detalle.varianteId,
                    );

                if (!variante) {
                    continue;
                }

                const anterior =
                    unidadesPorProducto.get(
                        variante.productoId,
                    ) ?? 0;

                unidadesPorProducto.set(
                    variante.productoId,
                    anterior + detalle.cantidad,
                );
            }
        }


        const resultado:
            ProductoMasVendido[] = [];

        for (const [productoId, unidades]
            of unidadesPorProducto) {

            const producto =
                await this.productoRepo.obtenerPorId(
                    productoId,
                );

            if (!producto) {
                continue;
            }

            resultado.push({
                productoId,
                nombre:
                    producto.nombre,
                unidadesVendidas:
                    unidades,
            });
        }


        return resultado
            .sort(
                (a, b) =>
                    b.unidadesVendidas -
                    a.unidadesVendidas,
            )
            .slice(
                0,
                CANTIDAD_MAS_VENDIDOS,
            );
    }
}
