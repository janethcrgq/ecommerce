import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Talla, Color } from '../catalogo/catalogo-admin.service';

export type EstadoOrden = 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'FALLIDO';
export type MetodoPago = 'TARJETA' | 'EFECTIVO' | 'TRANSFERENCIA';

export interface Comprador {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface DireccionEnvio {
  id: number;
  usuarioId: number;
  codigoPostal: string;
  numeroCasa: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
}

export interface Orden {
  id: number;
  usuarioId: number;
  direccionId: number;
  fecha: string;
  total: number;
  estado: EstadoOrden;
  comprador?: Comprador | null;
}

export interface Pago {
  id: number;
  ordenId: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  monto: number;
}

export interface Envio {
  id: number;
  ordenId: number;
  nombrePaqueteria: string;
  numeroGuia: string;
  fechaEnvio: string;
  fechaEntrega: string | null;
}

export interface DetalleOrdenProducto {
  id: number;
  ordenId: number;
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoId: number;
  nombre: string;
  imagen: string;
  talla: Talla;
  color: Color;
}

export interface OrdenDetalle {
  orden: Orden;
  comprador: Comprador | null;
  direccion: DireccionEnvio | null;
  detalles: DetalleOrdenProducto[];
  pago: Pago | null;
  envio: Envio | null;
}

export interface FiltrosOrden {
  [clave: string]: string | number | undefined;
  estado?: EstadoOrden | '';
  fechaDesde?: string;
  fechaHasta?: string;
  usuarioId?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdenesAdminService {
  private readonly api = inject(ApiService);

  listar(filtros: FiltrosOrden = {}): Observable<Orden[]> {
    return this.api.get<Orden[]>('/ordenes', filtros);
  }

  obtener(id: number): Observable<OrdenDetalle> {
    return this.api.get<OrdenDetalle>(`/ordenes/${id}`);
  }

  cambiarEstado(id: number, estado: EstadoOrden): Observable<Orden> {
    return this.api.patch<Orden>(`/ordenes/${id}`, { estado });
  }

  cambiarEstadoPago(id: number, estado: EstadoPago): Observable<Pago> {
    return this.api.patch<Pago>(`/ordenes/${id}/pago`, { estado });
  }

  registrarEnvio(id: number, nombrePaqueteria: string, numeroGuia: string): Observable<Envio> {
    return this.api.put<Envio>(`/ordenes/${id}/envio`, { nombrePaqueteria, numeroGuia });
  }
}
