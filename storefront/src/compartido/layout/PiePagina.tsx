import { NOMBRE_TIENDA } from '../marca';

export function PiePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie__contenido">
        <strong>{NOMBRE_TIENDA}</strong>
        <span>Proyecto de Temas Emergentes de Aplicaciones Web · Equipo Morado</span>
      </div>
    </footer>
  );
}
