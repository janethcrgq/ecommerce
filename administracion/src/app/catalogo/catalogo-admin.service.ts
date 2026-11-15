import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type Color = 'NEGRO' | 'BLANCO' | 'GRIS' | 'AZUL' | 'ROJO' | 'VERDE' | 'BEIGE';

export interface ProductoAdmin {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen: string;
}

export interface VarianteProducto {
  id: number;
  productoId: number;
  talla: Talla;
  color: Color;
  stock: number;
  stockMinimo: number;
}

export interface DetalleProducto {
  producto: ProductoAdmin;
  variantes: VarianteProducto[];
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface FiltrosProducto {
  [clave: string]: string | number | boolean | undefined;
  categoriaId?: number;
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  ordenarPor?: 'precio' | 'nombre';
  direccion?: 'asc' | 'desc';
}

export interface DatosProducto {
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen: string;
}

export interface DatosVariante {
  talla: Talla;
  color: Color;
  stock: number;
  stockMinimo: number;
}

export interface DatosCategoria {
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogoAdminService {
  private readonly api = inject(ApiService);

  listarProductos(filtros: FiltrosProducto = {}): Observable<ProductoAdmin[]> {
    return this.api.get<ProductoAdmin[]>('/admin/productos', filtros);
  }

  obtenerProducto(id: number): Observable<DetalleProducto> {
    return this.api.get<DetalleProducto>(`/admin/productos/${id}`);
  }

  crearProducto(datos: DatosProducto): Observable<ProductoAdmin> {
    return this.api.post<ProductoAdmin>('/productos', datos);
  }

  actualizarProducto(id: number, datos: Partial<DatosProducto>): Observable<ProductoAdmin> {
    return this.api.patch<ProductoAdmin>(`/productos/${id}`, datos);
  }

  crearVariante(productoId: number, datos: DatosVariante): Observable<VarianteProducto> {
    return this.api.post<VarianteProducto>(`/productos/${productoId}/variantes`, datos);
  }

  listarCategorias(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/categorias');
  }

  crearCategoria(datos: DatosCategoria): Observable<Categoria> {
    return this.api.post<Categoria>('/categorias', datos);
  }

  actualizarCategoria(id: number, datos: DatosCategoria): Observable<Categoria> {
    return this.api.patch<Categoria>(`/categorias/${id}`, datos);
  }

  eliminarCategoria(id: number): Observable<void> {
    return this.api.delete<void>(`/categorias/${id}`);
  }
}
