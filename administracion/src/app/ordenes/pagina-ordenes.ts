import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdenesAdminService, Orden, EstadoOrden } from './ordenes-admin.service';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';

@Component({
  selector: 'app-pagina-ordenes',
  imports: [ReactiveFormsModule, RouterLink, Cargando, MensajeError],
  templateUrl: './pagina-ordenes.html',
  styleUrl: './pagina-ordenes.css',
})
export class PaginaOrdenes {
  private readonly ordenesService = inject(OrdenesAdminService);
  private readonly fb = inject(FormBuilder);

  readonly ordenes = signal<Orden[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly filtros = this.fb.group({
    estado: this.fb.control<EstadoOrden | ''>('', { nonNullable: true }),
    fechaDesde: this.fb.control('', { nonNullable: true }),
    fechaHasta: this.fb.control('', { nonNullable: true }),
    usuarioId: this.fb.control<number | null>(null),
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    const valor = this.filtros.getRawValue();
    try {
      const datos = await firstValueFrom(this.ordenesService.listar({
        estado: valor.estado || undefined,
        fechaDesde: valor.fechaDesde || undefined,
        fechaHasta: valor.fechaHasta || undefined,
        usuarioId: valor.usuarioId ?? undefined,
      }));
      this.ordenes.set(datos.slice().sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)));
    } catch (error) {
      this.error.set(mensajeErrorApi(error, 'No fue posible cargar las órdenes.'));
    } finally {
      this.cargando.set(false);
    }
  }

  async limpiar(): Promise<void> {
    this.filtros.reset({ estado: '', fechaDesde: '', fechaHasta: '', usuarioId: null });
    await this.cargar();
  }

  formatoMoneda(valor: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
  }

  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
