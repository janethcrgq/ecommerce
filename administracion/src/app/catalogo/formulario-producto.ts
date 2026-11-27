import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, Categoria, Color, DatosProducto, Talla } from './catalogo-admin.service';
import { mensajeErrorApi } from '../api/error-api';
import { resolverUrlImagen } from '../api/config';
import { Cargando } from '../compartido/cargando';
import { RecursoNoEncontrado } from '../compartido/recurso-no-encontrado';
import { Confirmacion } from '../compartido/confirmacion';
import { ConCambiosPendientes } from '../compartido/cambios-pendientes.guard';

@Component({
  selector: 'app-formulario-producto',
  imports: [ReactiveFormsModule, RouterLink, Cargando, RecursoNoEncontrado, Confirmacion],
  templateUrl: './formulario-producto.html',
  styleUrl: './formulario-producto.css',
})
export class FormularioProducto implements ConCambiosPendientes, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly catalogo = inject(CatalogoAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly errorImagen = signal('');
  readonly noEncontrado = signal(false);
  readonly enviado = signal(false);
  readonly productoId = signal<number | null>(null);
  readonly guardado = signal(false);
  readonly estadoInicialActivo = signal(true);
  readonly confirmarDesactivacion = signal(false);
  readonly imagenActual = signal('');
  readonly previsualizacion = signal('');
  readonly nombreArchivo = signal('');
  readonly archivoSeleccionado = signal<File | null>(null);

  private urlTemporal = '';

  readonly tallas: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  readonly colores: Color[] = ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'BEIGE'];

  // primera variante con su stock inicial. es opcional, pero si se llena una parte hay que llenarla completa
  readonly variante = this.fb.group({
    talla: this.fb.control<Talla | null>(null),
    color: this.fb.control<Color | null>(null),
    stock: this.fb.control<number | null>(null, [Validators.min(0), Validators.pattern(/^\d+$/)]),
    stockMinimo: this.fb.control<number | null>(null, [Validators.min(0), Validators.pattern(/^\d+$/)]),
  });

  readonly formulario = this.fb.group({
    categoriaId: this.fb.control<number | null>(null, [Validators.required]),
    nombre: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]),
    descripcion: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]),
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    activo: this.fb.control(true, { nonNullable: true }),
  });

  constructor() {
    const parametro = this.route.snapshot.paramMap.get('id');
    this.productoId.set(parametro ? Number(parametro) : null);
    void this.cargar();
  }

  get editando(): boolean {
    return this.productoId() !== null;
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    this.noEncontrado.set(false);

    try {
      const categorias = await firstValueFrom(this.catalogo.listarCategorias());
      this.categorias.set(categorias);

      const id = this.productoId();
      if (id !== null) {
        const detalle = await firstValueFrom(this.catalogo.obtenerProducto(id));
        this.formulario.reset({
          categoriaId: detalle.producto.categoriaId,
          nombre: detalle.producto.nombre,
          descripcion: detalle.producto.descripcion,
          precio: detalle.producto.precio,
          activo: detalle.producto.activo,
        });
        this.estadoInicialActivo.set(detalle.producto.activo);
        this.imagenActual.set(detalle.producto.imagen);
        this.previsualizacion.set(resolverUrlImagen(detalle.producto.imagen));
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.noEncontrado.set(true);
      } else {
        this.error.set(mensajeErrorApi(error, 'No fue posible cargar el formulario.'));
      }
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorImagen.set('');

    if (!archivo) return;

    const tipos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tipos.includes(archivo.type)) {
      this.errorImagen.set('Selecciona una imagen JPG, PNG o WEBP.');
      input.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.errorImagen.set('La imagen debe pesar máximo 5 MB.');
      input.value = '';
      return;
    }

    this.liberarUrlTemporal();
    this.urlTemporal = URL.createObjectURL(archivo);
    this.previsualizacion.set(this.urlTemporal);
    this.archivoSeleccionado.set(archivo);
    this.nombreArchivo.set(archivo.name);
  }

  quitarImagenSeleccionada(): void {
    this.liberarUrlTemporal();
    this.archivoSeleccionado.set(null);
    this.nombreArchivo.set('');
    this.errorImagen.set('');

    const actual = this.imagenActual();
    this.previsualizacion.set(actual ? resolverUrlImagen(actual) : '');
  }

  guardar(): void {
    this.enviado.set(true);
    this.error.set('');
    this.errorImagen.set('');
    this.formulario.markAllAsTouched();

    const necesitaImagen = !this.editando && !this.archivoSeleccionado();
    if (necesitaImagen) {
      this.errorImagen.set('Selecciona una imagen para el producto.');
    }

    if (this.formulario.invalid || necesitaImagen || (!this.editando && this.varianteInvalida)) return;

    // al desactivar un producto activo, solicitar confirmación antes de completar la operación
    if (this.editando && this.estadoInicialActivo() && !this.formulario.getRawValue().activo) {
      this.confirmarDesactivacion.set(true);
      return;
    }

    void this.ejecutarGuardado();
  }

  confirmarYGuardar(): void {
    this.confirmarDesactivacion.set(false);
    void this.ejecutarGuardado();
  }

  private async ejecutarGuardado(): Promise<void> {
    this.guardando.set(true);

    try {
      let imagen = this.imagenActual();
      const archivo = this.archivoSeleccionado();

      if (archivo) {
        const subida = await firstValueFrom(this.catalogo.subirImagen(archivo));
        imagen = subida.imagen;
      }

      if (!imagen) {
        this.errorImagen.set('Selecciona una imagen para el producto.');
        return;
      }

      const valor = this.formulario.getRawValue();
      const datos: DatosProducto = {
        categoriaId: valor.categoriaId!,
        nombre: valor.nombre!.trim(),
        descripcion: valor.descripcion!.trim(),
        precio: valor.precio!,
        imagen,
        activo: valor.activo,
      };

      const id = this.productoId();
      const producto = id === null
        ? await firstValueFrom(this.catalogo.crearProducto(datos))
        : await firstValueFrom(this.catalogo.actualizarProducto(id, datos));

      // al crear, si llenaron la primera variante se registra enseguida con su stock inicial
      let resultado = id === null ? 'creado' : 'editado';
      if (id === null && this.quiereVariante) {
        const v = this.variante.getRawValue();
        try {
          await firstValueFrom(this.catalogo.crearVariante(producto.id, {
            talla: v.talla!,
            color: v.color!,
            stock: v.stock!,
            stockMinimo: v.stockMinimo ?? 0,
          }));
          resultado = 'creado-con-variante';
        } catch {
          // el producto ya existe, así que se avisa en su detalle para que agreguen la variante ahí
          resultado = 'creado-sin-variante';
        }
      }

      this.guardado.set(true);
      this.formulario.markAsPristine();
      await this.router.navigate(['/productos', producto.id], {
        queryParams: { guardado: resultado },
      });
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.guardando.set(false);
    }
  }

  // se considera que quieren crear la variante si llenaron cualquiera de sus campos
  get quiereVariante(): boolean {
    const v = this.variante.getRawValue();
    return v.talla !== null || v.color !== null || v.stock !== null || v.stockMinimo !== null;
  }

  errorVariante(campo: 'talla' | 'color' | 'stock'): boolean {
    if (!this.enviado() || !this.quiereVariante) return false;
    const v = this.variante.getRawValue();
    if (campo === 'talla') return v.talla === null;
    if (campo === 'color') return v.color === null;
    return v.stock === null || this.variante.controls.stock.invalid;
  }

  get varianteInvalida(): boolean {
    if (!this.quiereVariante) return false;
    const v = this.variante.getRawValue();
    return v.talla === null || v.color === null || v.stock === null || this.variante.invalid;
  }

  mostrarError(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  tieneCambiosPendientes(): boolean {
    return (this.formulario.dirty || this.variante.dirty || this.archivoSeleccionado() !== null) && !this.guardado();
  }

  @HostListener('window:beforeunload', ['$event'])
  prevenirCierre(evento: BeforeUnloadEvent): void {
    if (this.tieneCambiosPendientes()) {
      evento.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.liberarUrlTemporal();
  }

  private liberarUrlTemporal(): void {
    if (this.urlTemporal) {
      URL.revokeObjectURL(this.urlTemporal);
      this.urlTemporal = '';
    }
  }
}
