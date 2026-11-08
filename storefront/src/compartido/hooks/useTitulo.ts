// cambia el título de la pestaña del navegador según la pantalla.
import { useEffect } from 'react';
import { NOMBRE_TIENDA } from '../marca';

export function useTitulo(titulo?: string) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · ${NOMBRE_TIENDA}` : NOMBRE_TIENDA;
  }, [titulo]);
}
