import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { VarianteProducto } from '../catalogo/catalogo-admin.service';

export type MotivoAjuste = 'ENTRADA' | 'MERMA' | 'CORRECCION';

export interface AjusteInventario {
  id: number;
  varianteId: number;
  usuarioId: number;
  fecha: string;
  cantidad: number;
  motivo: MotivoAjuste;
}

export interface DatosAjuste {
  varianteId: number;
  cantidad: number;
  motivo: MotivoAjuste;
}

@Injectable({ providedIn: 'root' })
export class InventarioAdminService {
  private readonly api = inject(ApiService);

  listarVariantes(stockBajo = false): Observable<VarianteProducto[]> {
    return this.api.get<VarianteProducto[]>('/variantes', {
      stockBajo: stockBajo ? 'true' : 'false',
    });
  }

  listarAjustes(varianteId?: number): Observable<AjusteInventario[]> {
    return this.api.get<AjusteInventario[]>('/ajustes-inventario', {
      varianteId,
    });
  }

  crearAjuste(datos: DatosAjuste): Observable<AjusteInventario> {
    return this.api.post<AjusteInventario>('/ajustes-inventario', datos);
  }
}
