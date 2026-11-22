import { Component, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, Categoria } from './catalogo-admin.service';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';
import { Confirmacion } from '../compartido/confirmacion';
import { ConCambiosPendientes } from '../compartido/cambios-pendientes.guard';

@Component({
  selector: 'app-pagina-categorias',
  imports: [ReactiveFormsModule, Cargando, MensajeError, Confirmacion],
  templateUrl: './pagina-categorias.html',
  styleUrl: './pagina-categorias.css',
})
export class PaginaCategorias implements ConCambiosPendientes {
  private readonly catalogo = inject(CatalogoAdminService);
  private readonly fb = inject(FormBuilder);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly errorOperacion = signal('');
  readonly mensaje = signal('');
  readonly editando = signal<Categoria | null>(null);
  readonly eliminando = signal<Categoria | null>(null);
  readonly guardando = signal(false);
  readonly procesandoEliminar = signal(false);
  readonly enviado = signal(false);

  readonly formulario = this.fb.group({
    nombre: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    descripcion: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]),
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set('');
    try {
      this.categorias.set(await firstValueFrom(this.catalogo.listarCategorias()));
    } catch (error) {
      this.errorCarga.set(mensajeErrorApi(error, 'No fue posible cargar las categorías.'));
    } finally {
      this.cargando.set(false);
    }
  }

  editar(categoria: Categoria): void {
    if (this.formulario.dirty && !window.confirm('Tienes cambios sin guardar. ¿Quieres descartarlos?')) {
      return;
    }
    this.editando.set(categoria);
    this.errorOperacion.set('');
    this.mensaje.set('');
    this.formulario.reset({ nombre: categoria.nombre, descripcion: categoria.descripcion });
    this.formulario.markAsPristine();
    this.enviado.set(false);
  }

  cancelarEdicion(): void {
    if (this.formulario.dirty && !window.confirm('Tienes cambios sin guardar. ¿Quieres descartarlos?')) {
      return;
    }
    this.editando.set(null);
    this.formulario.reset({ nombre: '', descripcion: '' });
    this.formulario.markAsPristine();
    this.enviado.set(false);
    this.errorOperacion.set('');
  }

  async guardar(): Promise<void> {
    this.enviado.set(true);
    this.errorOperacion.set('');
    this.mensaje.set('');
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;

    const valor = this.formulario.getRawValue();
    const datos = { nombre: valor.nombre!.trim(), descripcion: valor.descripcion!.trim() };
    this.guardando.set(true);
    try {
      const actual = this.editando();
      const mensajeExito = actual
        ? 'Categoría actualizada correctamente.'
        : 'Categoría creada correctamente.';

      if (actual) {
        await firstValueFrom(this.catalogo.actualizarCategoria(actual.id, datos));
      } else {
        await firstValueFrom(this.catalogo.crearCategoria(datos));
      }
      // El guardado ya fue exitoso: no hay cambios pendientes que descartar.
      this.formulario.markAsPristine();
      this.cancelarEdicion();
      this.mensaje.set(mensajeExito);
      await this.cargarSinEstado();
    } catch (error) {
      this.errorOperacion.set(mensajeErrorApi(error));
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(): Promise<void> {
    const categoria = this.eliminando();
    if (!categoria) return;

    this.procesandoEliminar.set(true);
    this.errorOperacion.set('');
    this.mensaje.set('');
    try {
      await firstValueFrom(this.catalogo.eliminarCategoria(categoria.id));
      this.eliminando.set(null);
      this.mensaje.set('Categoría eliminada correctamente.');
      await this.cargarSinEstado();
    } catch (error) {
      this.eliminando.set(null);
      this.errorOperacion.set(mensajeErrorApi(error));
    } finally {
      this.procesandoEliminar.set(false);
    }
  }

  private async cargarSinEstado(): Promise<void> {
    this.categorias.set(await firstValueFrom(this.catalogo.listarCategorias()));
  }

  tieneCambiosPendientes(): boolean {
    return this.formulario.dirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  prevenirCierre(evento: BeforeUnloadEvent): void {
    if (this.tieneCambiosPendientes()) {
      evento.preventDefault();
    }
  }

  errorCampo(campo: 'nombre' | 'descripcion'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }
}
