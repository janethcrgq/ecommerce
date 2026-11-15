export const API_URL = 'http://localhost:3001';

export function resolverUrlImagen(imagen: string): string {
  if (!imagen) return '';
  if (/^https?:\/\//i.test(imagen)) return imagen;

  if (imagen.startsWith('/uploads/')) {
    return `${API_URL}${imagen}`;
  }

  const limpia = imagen.replace(/^\/+/, '');
  if (limpia.startsWith('productos/')) {
    return `/${limpia}`;
  }

  const nombreArchivo = limpia.split('/').pop() ?? limpia;
  return `/productos/${nombreArchivo}`;
}
