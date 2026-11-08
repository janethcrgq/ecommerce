// funciones para mostrar dinero, fechas e imágenes de la misma forma en toda la tienda.

const moneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatoMoneda(cantidad: number): string {
  return moneda.format(cantidad);
}

export function formatoFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// las fotos de los productos están en la carpeta public/productos del portal.
// la base de datos solo guarda el nombre del archivo.
export function urlImagen(imagen: string): string {
  return `/productos/${imagen}`;
}
