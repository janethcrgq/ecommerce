// el hook que usan todas las pantallas que piden datos al servicio.
// maneja las tres primeras situaciones: cargando, listo y error.
// (la cuarta, "no hay nada que mostrar", la resuelve el componente EstadoDatos)
import { useCallback, useEffect, useState } from 'react';
import { ErrorApi } from '../../api/errores';

export type ResultadoDatos<T> =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; datos: T }
  | { tipo: 'error'; error: ErrorApi };


// "pedir" es la función que hace la petición.
// "dependencias" son los valores que, al cambiar, vuelven a pedir los datos
// (por ejemplo el id de la URL o los filtros).
export function useDatos<T>(
  pedir: () => Promise<T>,
  dependencias: unknown[],
) {
  const [resultado, setResultado] = useState<ResultadoDatos<T>>({ tipo: 'cargando' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // si la pantalla cambia antes de que llegue la respuesta, se ignora
    let cancelado = false;

    setResultado({ tipo: 'cargando' });

    pedir()
      .then((datos) => {
        if (!cancelado) setResultado({ tipo: 'listo', datos });
      })
      .catch((error: unknown) => {
        if (cancelado) return;

        setResultado({
          tipo: 'error',
          error: error instanceof ErrorApi
            ? error
            : new ErrorApi('Ocurrió un problema inesperado. Intenta de nuevo.', 'otro'),
        });
      });

    return () => {
      cancelado = true;
    };
  }, [...dependencias, intento]);

  // vuelve a pedir los datos (botón "Reintentar")
  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return { resultado, recargar };
}
