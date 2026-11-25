import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService, ResumenDashboard } from './dashboard.service';
import { CatalogoAdminService } from '../catalogo/catalogo-admin.service';
import { MensajeError } from '../compartido/mensaje-error';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';

@Component({
  selector: 'app-pagina-dashboard',
  imports: [CurrencyPipe, DatePipe, MensajeError, Cargando],
  templateUrl: './pagina-dashboard.html',
  styleUrl: './pagina-dashboard.css',
})
export class PaginaDashboard {
  private readonly dashboard = inject(DashboardService);
  private readonly catalogo = inject(CatalogoAdminService);

  readonly datos = signal<ResumenDashboard | null>(null);
  // nombres de los productos, para no mostrar solo su número
  readonly nombres = signal<Record<number, string>>({});
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly desde = signal('');
  readonly hasta = signal('');
  readonly errorPeriodo = signal('');

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    // el servicio no avisa si las fechas están al revés, así que se valida aquí
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.errorPeriodo.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }

    this.errorPeriodo.set('');
    this.cargando.set(true);
    this.error.set('');

    try {
      const datos = await firstValueFrom(
        this.dashboard.obtener(this.desde(), this.hasta()),
      );
      this.datos.set(datos);

      // si falla la lista de nombres, el resumen se muestra igual con el número
      try {
        const productos = await firstValueFrom(this.catalogo.listarProductos());
        this.nombres.set(Object.fromEntries(productos.map((producto) => [producto.id, producto.nombre])));
      } catch {
        this.nombres.set({});
      }
    } catch (error) {
      this.error.set(mensajeErrorApi(error, 'No fue posible cargar el resumen de la tienda.'));
    } finally {
      this.cargando.set(false);
    }
  }

  nombreProducto(id: number): string {
    return this.nombres()[id] ?? `Producto #${id}`;
  }

  actualizarDesde(evento: Event): void {
    this.desde.set((evento.target as HTMLInputElement).value);
  }

  actualizarHasta(evento: Event): void {
    this.hasta.set((evento.target as HTMLInputElement).value);
  }

  limpiarPeriodo(): void {
    this.errorPeriodo.set('');
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
