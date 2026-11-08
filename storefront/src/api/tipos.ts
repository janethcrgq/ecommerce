// los tipos de lo que viaja entre el portal y el servicio.
// son los mismos que declara el servicio (carpeta src de la raíz del repo),
// escritos una sola vez aquí. las fechas llegan como texto porque así viajan en json.

export type RolUsuario = 'CLIENTE' | 'ADMINISTRADOR';
export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type Color = 'NEGRO' | 'BLANCO' | 'GRIS' | 'AZUL' | 'ROJO' | 'VERDE' | 'BEIGE';
export type MetodoPago = 'TARJETA' | 'EFECTIVO' | 'TRANSFERENCIA';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'FALLIDO';
export type EstadoOrden = 'PENDIENTE' | 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO';


// el formato uniforme de respuesta del servicio
export interface RespuestaOk<T> {
  ok: true;
  datos: T;
}

export interface RespuestaError {
  ok: false;
  statusCode: number;
  mensaje: string | string[];
  // nombre de la regla del negocio que falló (solo en errores de dominio)
  codigo?: string;
  ruta: string;
  fecha: string;
}


// usuarios y sesión
export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  telefono: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface Direccion {
  id: number;
  usuarioId: number;
  codigoPostal: string;
  numeroCasa: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
}


// catálogo
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen: string;
}

export interface Variante {
  id: number;
  productoId: number;
  talla: Talla;
  color: Color;
  stock: number;
  stockMinimo: number;
}

export interface DetalleProducto {
  producto: Producto;
  variantes: Variante[];
}

export interface FiltrosProducto {
  categoriaId?: number;
  nombre?: string;
  precioMin?: number;
  precioMax?: number;
  ordenarPor?: 'precio' | 'nombre';
  direccion?: 'asc' | 'desc';
}


// carrito
export interface ItemCarrito {
  id: number;
  carritoId: number;
  varianteId: number;
  cantidad: number;
}

export interface ItemCarritoDetalle {
  varianteId: number;
  productoId: number;
  nombre: string;
  imagen: string;
  talla: Talla;
  color: Color;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stockDisponible: number;
}

export interface CarritoDetalle {
  items: ItemCarritoDetalle[];
  total: number;
}


// órdenes
export interface Orden {
  id: number;
  usuarioId: number;
  direccionId: number;
  fecha: string;
  total: number;
  estado: EstadoOrden;
}

export interface DetalleOrden {
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

export interface OrdenDetalle {
  orden: Orden;
  detalles: DetalleOrden[];
  pago: Pago | null;
  envio: Envio | null;
}
