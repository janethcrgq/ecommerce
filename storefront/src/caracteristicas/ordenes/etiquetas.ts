// los textos en español de los estados y métodos que el servicio manda en mayúsculas.
import type { EstadoOrden, EstadoPago, MetodoPago } from '../../api/tipos';

// en el orden en que avanza una orden
export const ESTADOS_ORDEN: EstadoOrden[] = ['PENDIENTE', 'PROCESANDO', 'ENVIADO', 'ENTREGADO'];

export const TEXTO_ESTADO_ORDEN: Record<EstadoOrden, string> = {
  PENDIENTE: 'Pendiente',
  PROCESANDO: 'Procesando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
};

export const TEXTO_ESTADO_PAGO: Record<EstadoPago, string> = {
  PENDIENTE: 'Pendiente de pago',
  PAGADO: 'Pagado',
  FALLIDO: 'Pago fallido',
};

export const TEXTO_METODO_PAGO: Record<MetodoPago, string> = {
  TARJETA: 'Tarjeta',
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
};
