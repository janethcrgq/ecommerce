// junta las 4 situaciones de una pantalla que pide datos:
// cargando = <Cargando />
// error = <MensajeError />
// vacío = <EstadoVacio />
// con datos = lo que se pase como "children" 
// así ninguna pantalla se olvida de alguna.
import type { ReactNode } from 'react';
import type { ResultadoDatos } from '../hooks/useDatos';
import { Cargando } from './Cargando';
import { EstadoVacio } from './EstadoVacio';
import { MensajeError } from './MensajeError';

interface EstadoDatosProps<T> {
  resultado: ResultadoDatos<T>;
  alReintentar: () => void;
  // dice cuándo los datos cuentan como "vacíos" (por ejemplo, una lista sin elementos)
  estaVacio?: (datos: T) => boolean;
  tituloVacio?: string;
  textoVacio?: string;
  accionVacia?: ReactNode;
  children: (datos: T) => ReactNode;
}

export function EstadoDatos<T>({
  resultado,
  alReintentar,
  estaVacio,
  tituloVacio = 'No hay nada por aquí',
  textoVacio,
  accionVacia,
  children,
}: EstadoDatosProps<T>) {
  if (resultado.tipo === 'cargando') {
    return <Cargando />;
  }

  if (resultado.tipo === 'error') {
    return <MensajeError error={resultado.error} alReintentar={alReintentar} />;
  }

  if (estaVacio?.(resultado.datos)) {
    return <EstadoVacio titulo={tituloVacio} texto={textoVacio} accion={accionVacia} />;
  }

  return <>{children(resultado.datos)}</>;
}
