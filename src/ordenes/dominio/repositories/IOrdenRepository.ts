import { Orden } from "../entidades/orden";
import { EstadoOrden } from "../enums/estadoOrdenEnum";

export interface FiltrosOrden{
  estado?: EstadoOrden;
  fechaDesde?: Date;
  fechaHasta?: Date;
  usuarioId?: string;  
}

export interface IOrdenRepository{
  guardar(orden: Orden): Promise<Orden>;
  obtenerPorId(id: string): Promise<Orden | null>;
  listar(filtros?: FiltrosOrden): Promise<Orden[]>;
  actualizarEstado(id: string, estado: EstadoOrden): Promise<void>;
  
}