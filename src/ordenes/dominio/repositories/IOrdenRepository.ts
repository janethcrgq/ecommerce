import { DetalleOrden } from '../entidades/detalleOrden';
import { Orden } from '../entidades/orden';
import { Pago } from '../entidades/pago';
import { EstadoOrden } from '../enums/estadoOrdenEnum';

export interface FiltrosOrden {
  estado?: EstadoOrden;
  fechaDesde?: Date;
  fechaHasta?: Date;
  usuarioId?: number;
}

// todo lo que se guarda cuando se confirma una compra.
export interface DatosCompra {
  orden: Orden;
  detalles: DetalleOrden[];
  pago: Pago;
  carritoId: number;
}

export interface IOrdenRepository {
  // revisar el stock, descontarlo, guardar la orden con su pago
  // y vaciar el carrito es UNA sola operacion.
  // si algo falla no queda nada a medias.
  confirmarCompra(
    datos: DatosCompra,
  ): Promise<{
    orden: Orden;
    pago: Pago;
  }>;

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