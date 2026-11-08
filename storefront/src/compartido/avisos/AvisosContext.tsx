// avisos cortos que aparecen arriba y se quitan solos (por ejemplo "Agregado al carrito").
// con un contexto, cualquier pantalla puede mostrar un aviso con useAvisos().
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type TipoAviso = 'exito' | 'error' | 'info';

interface Aviso {
  id: number;
  texto: string;
  tipo: TipoAviso;
}

interface ValorAvisos {
  mostrarAviso: (texto: string, tipo?: TipoAviso) => void;
}

const AvisosContext = createContext<ValorAvisos | null>(null);

// cuánto tiempo se ve un aviso (en milisegundos)
const DURACION = 5000;

let siguienteId = 1;

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const quitar = useCallback((id: number) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
  }, []);

  const mostrarAviso = useCallback(
    (texto: string, tipo: TipoAviso = 'info') => {
      const id = siguienteId++;

      setAvisos((actuales) => [...actuales, { id, texto, tipo }]);
      setTimeout(() => quitar(id), DURACION);
    },
    [quitar],
  );

  return (
    <AvisosContext value={{ mostrarAviso }}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`aviso aviso--${aviso.tipo}`}>
            <span>{aviso.texto}</span>
            <button
              className="aviso__cerrar"
              onClick={() => quitar(aviso.id)}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </AvisosContext>
  );
}

export function useAvisos() {
  const valor = useContext(AvisosContext);

  if (!valor) {
    throw new Error('useAvisos() tiene que usarse dentro del componente <ProveedorAvisos>');
  }

  return valor;
}
