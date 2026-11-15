import { Component, HostListener, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, Categoria, DatosProducto } from './catalogo-admin.service';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { RecursoNoEncontrado } from '../compartido/recurso-no-encontrado';
import { ConCambiosPendientes } from '../compartido/cambios-pendientes.guard';

@Component({
  selector: 'app-formulario-producto',
  imports: [ReactiveFormsModule, RouterLink, Cargando, RecursoNoEncontrado],
  templateUrl: './formulario-producto.html',
  styleUrl: './formulario-producto.css',
})
export class FormularioProducto implements ConCambiosPendientes {
  private readonly fb = inject(FormBuilder);
  private readonly catalogo = inject(CatalogoAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly noEncontrado = signal(false);
  readonly enviado = signal(false);
  readonly productoId = signal<number | null>(null);
  readonly guardado = signal(false);

  readonly formulario = this.fb.group({
    categoriaId: this.fb.control<number | null>(null, [Validators.required]),
    nombre: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]),
    descripcion: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)]),
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    imagen: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]),
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
          imagen: detalle.producto.imagen,
          activo: detalle.producto.activo,
        });
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

  async guardar(): Promise<void> {
    this.enviado.set(true);
    this.error.set('');
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    const valor = this.formulario.getRawValue();
    const datos: DatosProducto = {
      categoriaId: valor.categoriaId!,
      nombre: valor.nombre!.trim(),
      descripcion: valor.descripcion!.trim(),
      precio: valor.precio!,
      imagen: valor.imagen!.trim(),
      activo: valor.activo,
    };

    this.guardando.set(true);
    try {
      const id = this.productoId();
      const producto = id === null
        ? await firstValueFrom(this.catalogo.crearProducto(datos))
        : await firstValueFrom(this.catalogo.actualizarProducto(id, datos));

      this.guardado.set(true);
      this.formulario.markAsPristine();
      await this.router.navigate(['/productos', producto.id], {
        queryParams: { guardado: id === null ? 'creado' : 'editado' },
      });
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.guardando.set(false);
    }
  }

  mostrarError(campo: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  tieneCambiosPendientes(): boolean {
    return this.formulario.dirty && !this.guardado();
  }

  @HostListener('window:beforeunload', ['$event'])
  prevenirCierre(evento: BeforeUnloadEvent): void {
    if (this.tieneCambiosPendientes()) {
      evento.preventDefault();
    }
  }
}
