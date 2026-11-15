import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface VarianteStockBajo {
  id: number;
  productoId: number;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
}

export interface ProductoMasVendido {
  productoId: number;
  nombre: string;
  unidadesVendidas: number;
}

export interface ResumenDashboard {
  ordenesHoy: number;
  ventasTotales: number;
  desde: string;
  hasta: string;
  variantesStockBajo: VarianteStockBajo[];
  masVendidos: ProductoMasVendido[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  obtener(desde?: string, hasta?: string): Observable<ResumenDashboard> {
    return this.api.get<ResumenDashboard>('/dashboard', { desde, hasta });
  }
}
