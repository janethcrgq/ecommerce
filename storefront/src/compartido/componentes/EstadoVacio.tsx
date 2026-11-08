// situación 4: la consulta salió bien pero no hay nada que mostrar.
// una lista vacía tiene que decir por qué está vacía y qué se puede hacer.
import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  texto?: string;
  // por ejemplo un botón para ir al catálogo
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, texto, accion }: EstadoVacioProps) {
  return (
    <div className="estado">
      <h2 className="estado__titulo">{titulo}</h2>
      {texto && <p className="estado__texto">{texto}</p>}
      {accion}
    </div>
  );
}
