// funciones para mostrar dinero, fechas e imágenes de la misma forma en toda la tienda.

import { URL_API } from '../api/config';

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

export function urlImagen(imagen: string): string {
  if (!imagen) return '';
  if (/^https?:\/\//i.test(imagen)) return imagen;

  // Las imágenes nuevas que sube el administrador las sirve el backend.
  if (imagen.startsWith('/uploads/')) {
    return `${URL_API}${imagen}`;
  }

  // Las imágenes de la semilla siguen viviendo en public/productos.
  const limpia = imagen.replace(/^\/+/, '');
  const nombre = limpia.split('/').pop() ?? limpia;
  return `/productos/${nombre}`;
}
