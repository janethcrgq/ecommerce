// el error que lanza el cliente de la api.
// siempre trae un mensaje pensado para la persona que usa la tienda,
// no el mensaje técnico que manda el servicio.

export type TipoError =
  | 'sin_conexion'
  | 'sesion_expirada'
  | 'servidor'
  | 'regla'
  | 'otro';

export class ErrorApi extends Error {
  tipo: TipoError;
  estado: number | null;
  codigo: string | null;

  constructor(
    mensaje: string,
    tipo: TipoError,
    estado: number | null = null,
    codigo: string | null = null,
  ) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.tipo = tipo;
    this.estado = estado;
    this.codigo = codigo;
  }
}


// cada regla del negocio que rechaza algo (error 409) trae un código.
// aquí se traduce a un mensaje en lenguaje normal.
const MENSAJES_POR_CODIGO: Record<string, string> = {
  StockInsuficienteError: 'No hay suficientes piezas de ese producto. Elige una cantidad menor.',
  ProductoInactivoError: 'Ese producto ya no está disponible.',
  CantidadInvalidaError: 'La cantidad debe ser de al menos una pieza.',
  CarritoVacioError: 'Tu carrito está vacío. Agrega algo antes de comprar.',
  ItemNoEncontradoError: 'Ese producto ya no está en tu carrito.',
  DireccionNoPerteneceAlUsuarioError: 'Esa dirección no es tuya. Elige otra.',
  DireccionNoEncontradaError: 'No encontramos esa dirección.',
  CorreoYaRegistradoError: 'Ya hay una cuenta con ese correo. Prueba iniciar sesión.',
  CredencialesInvalidasError: 'El correo o la contraseña no son correctos.',
  PagoYaRealizadoError: 'Esta orden ya está pagada.',
  OrdenAjenaError: 'No puedes ver esa orden.',
  OrdenNoEncontradaError: 'No encontramos esa orden.',
  EnvioNoEncontradoError: 'Esta orden todavía no tiene un envío registrado.',
  ProductoNoEncontradoError: 'No encontramos ese producto.',
  VarianteNoEncontradaError: 'No encontramos esa talla o color.',
};


// si no hay un mensaje para el código, se usa uno según el tipo de error
export function mensajeParaUsuario(estado: number, codigo: string | null): string {
  if (codigo && MENSAJES_POR_CODIGO[codigo]) {
    return MENSAJES_POR_CODIGO[codigo];
  }

  switch (estado) {
    case 400:
      return 'Hay datos que no son válidos. Revisa lo que escribiste.';
    case 401:
      return 'Necesitas iniciar sesión para continuar.';
    case 403:
      return 'No tienes permiso para hacer esto.';
    case 404:
      return 'No encontramos lo que buscabas.';
    case 409:
      return 'No se pudo completar la acción. Intenta de nuevo.';
    default:
      return 'La tienda tuvo un problema. Intenta de nuevo en un momento.';
  }
}
