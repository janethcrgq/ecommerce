import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { resolverUrlImagen } from '../api/config';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';
import { Confirmacion } from '../compartido/confirmacion';
import { RecursoNoEncontrado } from '../compartido/recurso-no-encontrado';
import {
  EstadoOrden,
  EstadoPago,
  OrdenDetalle,
  OrdenesAdminService,
} from './ordenes-admin.service';

@Component({
  selector: 'app-pagina-detalle-orden',
  imports: [ReactiveFormsModule, RouterLink, Cargando, MensajeError, Confirmacion, RecursoNoEncontrado],
  templateUrl: './pagina-detalle-orden.html',
  styleUrl: './pagina-detalle-orden.css',
})
export class PaginaDetalleOrden {
  private readonly ordenes = inject(OrdenesAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly detalle = signal<OrdenDetalle | null>(null);
  readonly cargando = signal(true);
  readonly noEncontrado = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly procesando = signal(false);
  readonly accionConfirmar = signal<'estado' | 'pago' | null>(null);

  readonly pagoForm = this.fb.group({
    estado: this.fb.control<EstadoPago>('PENDIENTE', { nonNullable: true }),
  });

  readonly envioForm = this.fb.group({
    nombrePaqueteria: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
    numeroGuia: this.fb.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]),
  });

  constructor() {
    void this.cargar();
  }

  get ordenId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    this.noEncontrado.set(false);

    try {
      const detalle = await firstValueFrom(this.ordenes.obtener(this.ordenId));
      this.detalle.set(detalle);
      if (detalle.pago) {
        this.pagoForm.reset({ estado: detalle.pago.estado });
      }
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.noEncontrado.set(true);
      } else {
        this.error.set(mensajeErrorApi(error, 'No fue posible cargar la orden.'));
      }
    } finally {
      this.cargando.set(false);
    }
  }

  siguienteEstado(): EstadoOrden | null {
    const estado = this.detalle()?.orden.estado;
    if (estado === 'PENDIENTE') return 'PROCESANDO';
    if (estado === 'PROCESANDO') return 'ENVIADO';
    if (estado === 'ENVIADO') return 'ENTREGADO';
    return null;
  }

  prepararCambioEstado(): void {
    if (this.siguienteEstado()) this.accionConfirmar.set('estado');
  }

  prepararCambioPago(): void {
    if (this.detalle()?.pago) this.accionConfirmar.set('pago');
  }

  cancelarConfirmacion(): void {
    this.accionConfirmar.set(null);
  }

  async confirmarAccion(): Promise<void> {
    const accion = this.accionConfirmar();
    if (!accion) return;

    this.procesando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      if (accion === 'estado') {
        const siguiente = this.siguienteEstado();
        if (!siguiente) return;
        await firstValueFrom(this.ordenes.cambiarEstado(this.ordenId, siguiente));
        this.mensaje.set(`La orden avanzó a ${siguiente}.`);
      } else {
        const estado = this.pagoForm.controls.estado.value;
        await firstValueFrom(this.ordenes.cambiarEstadoPago(this.ordenId, estado));
        this.mensaje.set('Estado del pago actualizado.');
      }

      this.accionConfirmar.set(null);
      await this.cargarSinEstado();
    } catch (error) {
      this.accionConfirmar.set(null);
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.procesando.set(false);
    }
  }

  async registrarEnvio(): Promise<void> {
    this.envioForm.markAllAsTouched();
    this.error.set('');
    this.mensaje.set('');
    if (this.envioForm.invalid) return;

    this.procesando.set(true);
    const valor = this.envioForm.getRawValue();

    try {
      await firstValueFrom(this.ordenes.registrarEnvio(
        this.ordenId,
        valor.nombrePaqueteria!.trim(),
        valor.numeroGuia!.trim(),
      ));
      this.mensaje.set('Envío registrado correctamente.');
      this.envioForm.reset({ nombrePaqueteria: '', numeroGuia: '' });
      await this.cargarSinEstado();
    } catch (error) {
      this.error.set(mensajeErrorApi(error));
    } finally {
      this.procesando.set(false);
    }
  }

  private async cargarSinEstado(): Promise<void> {
    const detalle = await firstValueFrom(this.ordenes.obtener(this.ordenId));
    this.detalle.set(detalle);
    if (detalle.pago) this.pagoForm.reset({ estado: detalle.pago.estado });
  }

  textoConfirmacion(): string {
    if (this.accionConfirmar() === 'pago') {
      return `Se cambiará el pago a ${this.pagoForm.controls.estado.value}. ¿Deseas continuar?`;
    }
    const siguiente = this.siguienteEstado();
    return `La orden avanzará a ${siguiente ?? ''}. Este flujo no permite regresar al estado anterior.`;
  }

  tituloConfirmacion(): string {
    return this.accionConfirmar() === 'pago' ? 'Confirmar estado del pago' : 'Confirmar avance de la orden';
  }

  urlImagen(imagen: string): string {
    return resolverUrlImagen(imagen);
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
  }

  formatoFecha(fecha: string | null): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }

  etiquetaEstado(estado: string): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }
}
