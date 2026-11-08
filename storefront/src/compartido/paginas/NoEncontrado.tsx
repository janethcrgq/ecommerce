// pantalla para una dirección que no corresponde a nada (404).
import { Link } from 'react-router';
import { useTitulo } from '../hooks/useTitulo';

export default function NoEncontrado() {
  useTitulo('Página no encontrada');

  return (
    <div className="contenedor pagina">
      <div className="estado">
        <p className="estado__codigo">404</p>
        <h1 className="estado__titulo">No encontramos esta página</h1>
        <p className="estado__texto">
          La dirección que escribiste no existe o ya cambió de lugar.
        </p>
        <Link to="/" className="boton">Ir al inicio</Link>
      </div>
    </div>
  );
}
