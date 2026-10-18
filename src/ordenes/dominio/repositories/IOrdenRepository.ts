import { DetalleOrden } from '../entidades/detalleOrden';
import { Orden } from '../entidades/orden';
import { EstadoOrden } from '../enums/estadoOrdenEnum';

export interface FiltrosOrden {
  estado?: EstadoOrden;
  fechaDesde?: Date;
  fechaHasta?: Date;
  usuarioId?: number;
}

export interface IOrdenRepository {
  guardar(
    orden: Orden,
    detalles: DetalleOrden[],
  ): Promise<Orden>;

  obtenerPorId(
    id: number,
  ): Promise<Orden | null>;

  listar(
    filtros?: FiltrosOrden,
  ): Promise<Orden[]>;

  obtenerDetalles(
    ordenId: number,
  ): Promise<DetalleOrden[]>;

  actualizar(
    orden: Orden,
  ): Promise<Orden | null>;
}