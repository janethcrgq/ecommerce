import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService, ResumenDashboard } from './dashboard.service';
import { MensajeError } from '../compartido/mensaje-error';
import { Cargando } from '../compartido/cargando';

@Component({
  selector: 'app-pagina-dashboard',
  imports: [CurrencyPipe, DatePipe, MensajeError, Cargando],
  templateUrl: './pagina-dashboard.html',
  styleUrl: './pagina-dashboard.css',
})
export class PaginaDashboard {
  private readonly dashboard = inject(DashboardService);

  readonly datos = signal<ResumenDashboard | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly desde = signal('');
  readonly hasta = signal('');

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      const datos = await firstValueFrom(
        this.dashboard.obtener(this.desde(), this.hasta()),
      );
      this.datos.set(datos);
    } catch {
      this.error.set('No fue posible cargar el resumen de la tienda.');
    } finally {
      this.cargando.set(false);
    }
  }

  actualizarDesde(evento: Event): void {
    this.desde.set((evento.target as HTMLInputElement).value);
  }

  actualizarHasta(evento: Event): void {
    this.hasta.set((evento.target as HTMLInputElement).value);
  }

  limpiarPeriodo(): void {
    this.desde.set('');
    this.hasta.set('');
    void this.cargar();
  }

  sinActividad(): boolean {
    const datos = this.datos();
    return !!datos &&
      datos.ordenesHoy === 0 &&
      datos.ventasTotales === 0 &&
      datos.variantesStockBajo.length === 0 &&
      datos.masVendidos.length === 0;
  }
}
