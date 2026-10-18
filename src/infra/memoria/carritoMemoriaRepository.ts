import { Carrito } from '../../carrito/dominio/entidades/carrito';
import { ItemCarrito } from '../../carrito/dominio/entidades/itemCarrito';

import { ICarritoRepository } from '../../carrito/dominio/repositories/iCarritoRepository';


export class CarritoMemoriaRepository
    implements ICarritoRepository {

    private readonly carritos:
        Carrito[] = [];

    private readonly items:
        ItemCarrito[] = [];

    private siguienteCarritoId = 1;

    private siguienteItemId = 1;


    async obtenerPorUsuario(
        usuarioId: number,
    ): Promise<Carrito | null> {

        const carrito =
            this.carritos.find(
                (actual) =>
                    actual.usuarioId ===
                    usuarioId,
            );

        return carrito
            ? { ...carrito }
            : null;
    }


    async guardar(
        carrito: Carrito,
    ): Promise<Carrito> {

        const nuevo: Carrito = {
            ...carrito,
            id:
                carrito.id ||
                this.siguienteCarritoId++,
        };

        this.carritos.push({
            ...nuevo,
        });

        return {
            ...nuevo,
        };
    }


    async listarItems(
        carritoId: number,
    ): Promise<ItemCarrito[]> {

        return this.items
            .filter(
                (item) =>
                    item.carritoId ===
                    carritoId,
            )
            .map(
                (item) => ({
                    ...item,
                }),
            );
    }


    async obtenerItemPorVariante(
        carritoId: number,
        varianteId: number,
    ): Promise<ItemCarrito | null> {

        const item =
            this.items.find(
                (actual) =>
                    actual.carritoId ===
                    carritoId &&
                    actual.varianteId ===
                    varianteId,
            );

        return item
            ? { ...item }
            : null;
    }


    async guardarItem(
        item: ItemCarrito,
    ): Promise<ItemCarrito> {

        const nuevo: ItemCarrito = {
            ...item,
            id:
                item.id ||
                this.siguienteItemId++,
        };

        this.items.push({
            ...nuevo,
        });

        return {
            ...nuevo,
        };
    }


    async actualizarItem(
        item: ItemCarrito,
    ): Promise<ItemCarrito | null> {

        const indice =
            this.items.findIndex(
                (actual) =>
                    actual.id === item.id,
            );

        if (indice === -1) {
            return null;
        }


        this.items[indice] = {
            ...item,
        };


        return {
            ...item,
        };
    }


    async eliminarItem(
        itemId: number,
    ): Promise<void> {

        const indice =
            this.items.findIndex(
                (item) =>
                    item.id === itemId,
            );

        if (indice !== -1) {
            this.items.splice(
                indice,
                1,
            );
        }
    }


    async vaciar(
        carritoId: number,
    ): Promise<void> {

        for (
            let i =
                this.items.length - 1;
            i >= 0;
            i--
        ) {

            if (
                this.items[i].carritoId ===
                carritoId
            ) {
                this.items.splice(
                    i,
                    1,
                );
            }
        }
    }
}