import { Carrito } from '../../carrito/dominio/entidades/carrito';
import { ItemCarrito } from '../../carrito/dominio/entidades/itemCarrito';

import { ICarritoRepository } from '../../carrito/dominio/repositories/iCarritoRepository';

import { PrismaService } from './prisma.service';


export class CarritoPrismaRepository
    implements ICarritoRepository {

    constructor(
        private readonly prisma: PrismaService,
    ) { }


    // cada usuario tiene un solo carrito.
    async obtenerPorUsuario(
        usuarioId: number,
    ): Promise<Carrito | null> {

        return this.prisma.carrito.findUnique({
            where: { usuarioId },
        });
    }


    async guardar(
        carrito: Carrito,
    ): Promise<Carrito> {

        return this.prisma.carrito.create({
            data: {
                usuarioId: carrito.usuarioId,
            },
        });
    }


    async listarItems(
        carritoId: number,
    ): Promise<ItemCarrito[]> {

        return this.prisma.itemCarrito.findMany({
            where: { carritoId },
            orderBy: { id: 'asc' },
        });
    }


    async obtenerItemPorVariante(
        carritoId: number,
        varianteId: number,
    ): Promise<ItemCarrito | null> {

        return this.prisma.itemCarrito.findUnique({
            where: {
                carritoId_varianteId: {
                    carritoId,
                    varianteId,
                },
            },
        });
    }


    async guardarItem(
        item: ItemCarrito,
    ): Promise<ItemCarrito> {

        return this.prisma.itemCarrito.create({
            data: {
                carritoId: item.carritoId,
                varianteId: item.varianteId,
                cantidad: item.cantidad,
            },
        });
    }


    async actualizarItem(
        item: ItemCarrito,
    ): Promise<ItemCarrito | null> {

        const existente =
            await this.prisma.itemCarrito.findUnique({
                where: { id: item.id },
            });

        if (!existente) {
            return null;
        }

        return this.prisma.itemCarrito.update({
            where: { id: item.id },
            data: {
                cantidad: item.cantidad,
            },
        });
    }


    async eliminarItem(
        itemId: number,
    ): Promise<void> {

        await this.prisma.itemCarrito.deleteMany({
            where: { id: itemId },
        });
    }


    async vaciar(
        carritoId: number,
    ): Promise<void> {

        await this.prisma.itemCarrito.deleteMany({
            where: { carritoId },
        });
    }
}
