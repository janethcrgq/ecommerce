import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, Categoria, DetalleProducto, ProductoAdmin, Color, Talla } from './catalogo-admin.service';
import { resolverUrlImagen } from '../api/config';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';
import { Confirmacion } from '../compartido/confirmacion';
import { RecursoNoEncontrado } from '../compartido/recurso-no-encontrado';

@Component({
  selector: 'app-pagina-detalle-producto',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, Cargando, MensajeError, Confirmacion, RecursoNoEncontrado],
  templateUrl: './pagina-detalle-producto.html',
  styleUrl: './pagina-detalle-producto.css',
})
export class PaginaDetalleProducto {
  private readonly catalogo = inject(CatalogoAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly detalle = signal<DetalleProducto | null>(null);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly noEncontrado = signal(false);
  readonly mensaje = signal('');
  readonly mostrarVariante = signal(false);
  readonly guardandoVariante = signal(false);
  readonly enviadoVariante = signal(false);
  readonly confirmarEstado = signal(false);
  readonly procesandoEstado = signal(false);

  readonly tallas: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  readonly colores: Color[] = ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'BEIGE'];

  readonly formularioVariante = this.fb.group({
    talla: this.fb.control<Talla | null>(null, [Validators.required]),
    color: this.fb.control<Color | null>(null, [Validators.required]),
    stock: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    stockMinimo: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
  });

  constructor() {
    void this.cargar();
  }

  get productoId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    this.noEncontrado.set(false);
    try {
      const [detalle, categorias] = await Promise.all([
        firstValueFrom(this.catalogo.obtenerProducto(this.productoId)),
        firstValueFrom(this.catalogo.listarCategorias()),
      ]);
      this.detalle.set(detalle);
      this.categorias.set(categorias);

      const guardado = this.route.snapshot.queryParamMap.get('guardado');
      if (guardado === 'creado') this.mensaje.set('Producto creado correctamente. Ahora puedes agregar sus variantes.');
      if (guardado === 'creado-con-variante') this.mensaje.set('Producto creado correctamente con su existencia inicial.');
      if (guardado === 'creado-sin-variante') this.error.set('El producto se creó, pero no se pudo registrar su existencia inicial. Agrégala desde "Agregar variante".');
      if (guardado === 'editado') this.mensaje.set('Producto actualizado correctamente.');
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.noEncontrado.set(true);
      } else {
        this.error.set(mensajeErrorApi(error, 'No fue posible cargar el producto.'));
      }
    } finally {
      this.cargando.set(false);
    }
  }

  async guardarVariante(): Promise<void> {
    this.enviadoVariante.set(true);
    this.error.set('');
    this.mensaje.set('');
    this.formularioVariante.markAllAsTouched();
    if (this.formularioVariante.invalid) return;

    const valor = this.formularioVariante.getRawValue();
    this.guardandoVariante.set(true);
    try {
      await firstValueFrom(this.catalogo.crearVariante(this.productoId, {
        talla: valor.talla!,
        color: valor.color!,
        stock: valor.stock!,
        stockMinimo: valor.stockMinimo!,
      }));
      this.formularioVariante.reset({ talla: null, color: null, stock: 0, stockMinimo: 0 });
      this.formularioVariante.markAsPristine();
      this.enviadoVariante.set(false);
      this.mostrarVariante.set(false);
      this.mensaje.set('Variante agregada correctamente.');
      await this.recargarDetalle();
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.guardandoVariante.set(false);
    }
  }

  async cambiarEstado(): Promise<void> {
    const producto = this.detalle()?.producto;
    if (!producto) return;

    this.procesandoEstado.set(true);
    this.error.set('');
    try {
      const actualizado = await firstValueFrom(
        this.catalogo.actualizarProducto(producto.id, { activo: !producto.activo }),
      );
      const detalle = this.detalle();
      if (detalle) this.detalle.set({ ...detalle, producto: actualizado });
      this.confirmarEstado.set(false);
      this.mensaje.set(actualizado.activo ? 'Producto activado correctamente.' : 'Producto desactivado correctamente.');
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.procesandoEstado.set(false);
    }
  }

  async recargarDetalle(): Promise<void> {
    const detalle = await firstValueFrom(this.catalogo.obtenerProducto(this.productoId));
    this.detalle.set(detalle);
  }

  categoria(producto: ProductoAdmin): string {
    return this.categorias().find((categoria) => categoria.id === producto.categoriaId)?.nombre ?? `Categoría #${producto.categoriaId}`;
  }

  imagen(ruta: string): string {
    return resolverUrlImagen(ruta);
  }

  errorVariante(campo: keyof typeof this.formularioVariante.controls): boolean {
    const control = this.formularioVariante.controls[campo];
    return control.invalid && (control.touched || this.enviadoVariante());
  }
}
