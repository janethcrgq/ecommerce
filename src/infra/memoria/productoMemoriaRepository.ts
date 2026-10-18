import { Producto } from '../../catalogo/dominio/entidades/producto';

import {
    FiltrosProducto,
    IProductosRepository,
} from '../../catalogo/dominio/repositories/iProductoRepository';


export class ProductoMemoriaRepository
    implements IProductosRepository {

    private readonly productos: Producto[] = [
        {
            id: 1,
            categoriaId: 1,
            nombre: 'Camiseta básica negra',
            descripcion: 'Camiseta casual de color negro',
            precio: 350,
            activo: true,
            imagen: 'camiseta-negra.jpg',
        },
        {
            id: 2,
            categoriaId: 2,
            nombre: 'Sudadera gris',
            descripcion: 'Sudadera casual de color gris',
            precio: 650,
            activo: true,
            imagen: 'sudadera-gris.jpg',
        },
        {
            id: 3,
            categoriaId: 3,
            nombre: 'Pantalón negro',
            descripcion: 'Pantalón casual de color negro',
            precio: 500,
            activo: false,
            imagen: 'pantalon-negro.jpg',
        },
    ];

    private siguienteId = 4;


    async guardar(
        producto: Producto,
    ): Promise<Producto> {

        const nuevo: Producto = {
            ...producto,
            id:
                producto.id ||
                this.siguienteId++,
        };

        this.productos.push({
            ...nuevo,
        });

        return {
            ...nuevo,
        };
    }


    async obtenerPorId(
        id: number,
    ): Promise<Producto | null> {

        const producto =
            this.productos.find(
                (actual) =>
                    actual.id === id,
            );

        return producto
            ? { ...producto }
            : null;
    }


    async listar(
        filtros?: FiltrosProducto,
    ): Promise<Producto[]> {

        let resultado =
            [...this.productos];


        if (
            filtros?.categoriaId !==
            undefined
        ) {
            resultado =
                resultado.filter(
                    (producto) =>
                        producto.categoriaId ===
                        filtros.categoriaId,
                );
        }


        if (filtros?.nombre) {

            const nombre =
                filtros.nombre.toLowerCase();

            resultado =
                resultado.filter(
                    (producto) =>
                        producto.nombre
                            .toLowerCase()
                            .includes(nombre),
                );
        }


        if (
            filtros?.precioMin !==
            undefined
        ) {
            resultado =
                resultado.filter(
                    (producto) =>
                        producto.precio >=
                        filtros.precioMin!,
                );
        }


        if (
            filtros?.precioMax !==
            undefined
        ) {
            resultado =
                resultado.filter(
                    (producto) =>
                        producto.precio <=
                        filtros.precioMax!,
                );
        }


        return resultado.map(
            (producto) => ({
                ...producto,
            }),
        );
    }


    async actualizar(
        producto: Producto,
    ): Promise<Producto | null> {

        const indice =
            this.productos.findIndex(
                (actual) =>
                    actual.id === producto.id,
            );

        if (indice === -1) {
            return null;
        }


        this.productos[indice] = {
            ...producto,
        };


        return {
            ...producto,
        };
    }
}