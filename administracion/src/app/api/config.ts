export const API_URL = 'http://localhost:3001';

export function resolverUrlImagen(imagen: string): string {
  if (!imagen) return '';
  if (/^https?:\/\//i.test(imagen)) return imagen;

  const nombreArchivo = imagen.split('/').pop() ?? imagen;
  return `/productos/${nombreArchivo}`;
}
