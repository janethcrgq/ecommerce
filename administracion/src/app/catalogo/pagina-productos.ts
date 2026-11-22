import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, Categoria, ProductoAdmin } from './catalogo-admin.service';
import { resolverUrlImagen } from '../api/config';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';
import { Confirmacion } from '../compartido/confirmacion';

@Component({
  selector: 'app-pagina-productos',
  imports: [CurrencyPipe, RouterLink, Cargando, MensajeError, Confirmacion],
  templateUrl: './pagina-productos.html',
  styleUrl: './pagina-productos.css',
})
export class PaginaProductos {
  private readonly catalogo = inject(CatalogoAdminService);

  readonly productos = signal<ProductoAdmin[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly mensajeOperacion = signal('');
  readonly nombre = signal('');
  readonly categoriaId = signal<number | undefined>(undefined);
  readonly precioMin = signal<number | undefined>(undefined);
  readonly precioMax = signal<number | undefined>(undefined);
  readonly ordenarPor = signal<'nombre' | 'precio'>('nombre');
  readonly direccion = signal<'asc' | 'desc'>('asc');
  readonly estado = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  readonly productoEstado = signal<ProductoAdmin | null>(null);
  readonly procesandoEstado = signal(false);

  readonly productosVisibles = computed(() => {
    const estado = this.estado();
    return this.productos().filter((producto) => {
      if (estado === 'ACTIVOS') return producto.activo;
      if (estado === 'INACTIVOS') return !producto.activo;
      return true;
    });
  });

  constructor() {
    void this.cargarInicial();
  }

  async cargarInicial(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const [categorias] = await Promise.all([
        firstValueFrom(this.catalogo.listarCategorias()),
        this.cargarProductos(false),
      ]);
      this.categorias.set(categorias);
    } catch (error) {
      this.error.set(mensajeErrorApi(error, 'No fue posible cargar el catálogo administrativo.'));
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarProductos(mostrarCarga = true): Promise<void> {
    if (mostrarCarga) this.cargando.set(true);
    this.error.set('');
    this.mensajeOperacion.set('');
    try {
      const productos = await firstValueFrom(
        this.catalogo.listarProductos({
          nombre: this.nombre().trim() || undefined,
          categoriaId: this.categoriaId(),
          precioMin: this.precioMin(),
          precioMax: this.precioMax(),
          ordenarPor: this.ordenarPor(),
          direccion: this.direccion(),
        }),
      );
      this.productos.set(productos);
    } catch (error) {
      this.error.set(mensajeErrorApi(error, 'No fue posible cargar los productos.'));
    } finally {
      if (mostrarCarga) this.cargando.set(false);
    }
  }

  limpiar(): void {
    this.nombre.set('');
    this.categoriaId.set(undefined);
    this.precioMin.set(undefined);
    this.precioMax.set(undefined);
    this.ordenarPor.set('nombre');
    this.direccion.set('asc');
    this.estado.set('TODOS');
    void this.cargarProductos();
  }

  async cambiarEstado(): Promise<void> {
    const producto = this.productoEstado();
    if (!producto) return;

    this.procesandoEstado.set(true);
    this.mensajeOperacion.set('');
    try {
      await firstValueFrom(
        this.catalogo.actualizarProducto(producto.id, { activo: !producto.activo }),
      );
      this.productoEstado.set(null);
      await this.cargarProductos(false);
      this.mensajeOperacion.set(
        producto.activo ? 'Producto desactivado correctamente.' : 'Producto activado correctamente.',
      );
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.procesandoEstado.set(false);
    }
  }

  nombreCategoria(id: number): string {
    return this.categorias().find((categoria) => categoria.id === id)?.nombre ?? `Categoría #${id}`;
  }

  imagen(imagen: string): string {
    return resolverUrlImagen(imagen);
  }

  actualizarTexto(signal: { set(valor: string): void }, evento: Event): void {
    signal.set((evento.target as HTMLInputElement).value);
  }

  actualizarNumero(
    signal: { set(valor: number | undefined): void },
    evento: Event,
  ): void {
    const valor = (evento.target as HTMLInputElement | HTMLSelectElement).value;
    signal.set(valor === '' ? undefined : Number(valor));
  }
}
