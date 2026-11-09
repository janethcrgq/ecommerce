// cómo se muestra cada color: el nombre en español y el color real para el circulito.
import type { Color } from '../../api/tipos';

export const COLORES: Record<Color, { nombre: string; css: string }> = {
  NEGRO: { nombre: 'Negro', css: '#1f1b2e' },
  BLANCO: { nombre: 'Blanco', css: '#ffffff' },
  GRIS: { nombre: 'Gris', css: '#9a98a3' },
  AZUL: { nombre: 'Azul', css: '#2f5fb3' },
  ROJO: { nombre: 'Rojo', css: '#c0392b' },
  VERDE: { nombre: 'Verde', css: '#3c8d5a' },
  BEIGE: { nombre: 'Beige', css: '#d8c3a5' },
};
