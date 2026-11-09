// el historial: las órdenes del cliente, de la más reciente a la más antigua.
import { Link, useSearchParams } from 'react-router';
import type { EstadoOrden } from '../../api/tipos';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { formatoFecha, formatoMoneda } from '../../compartido/formato';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { ESTADOS_ORDEN, TEXTO_ESTADO_ORDEN } from './etiquetas';
import { listarOrdenes } from './ordenesServicio';

export default function PaginaOrdenes() {
  useTitulo('Mis órdenes');

  // el filtro de estado vive en la URL, igual que en el catálogo
  const [parametros, setParametros] = useSearchParams();
  const filtro = parametros.get('estado') ?? '';
  const estado = ESTADOS_ORDEN.find((e) => e === filtro);

  const { resultado, recargar } = useDatos(() => listarOrdenes(estado), [estado]);

  function cambiarFiltro(valor: string) {
    setParametros(valor ? { estado: valor } : {});
  }

  return (
    <section className="contenedor pagina">
      <h1 className="pagina__titulo">Mis órdenes</h1>

      <div className="campo campo--corto">
        <label className="campo__etiqueta" htmlFor="estado">
          Mostrar
        </label>
        <select
          id="estado"
          className="campo__entrada"
          value={estado ?? ''}
          onChange={(e) => cambiarFiltro(e.target.value)}
        >
          <option value="">Todas</option>
          {ESTADOS_ORDEN.map((e: EstadoOrden) => (
            <option key={e} value={e}>
              {TEXTO_ESTADO_ORDEN[e]}
            </option>
          ))}
        </select>
      </div>

      <EstadoDatos
        resultado={resultado}
        alReintentar={recargar}
        estaVacio={(ordenes) => ordenes.length === 0}
        tituloVacio={estado ? 'No hay órdenes con ese estado' : 'Todavía no has comprado nada'}
        textoVacio={
          estado
            ? 'Prueba con otro estado.'
            : 'Cuando hagas una compra, la verás aquí.'
        }
        accionVacia={
          estado ? undefined : (
            <Link to="/productos" className="boton">
              Ver el catálogo
            </Link>
          )
        }
      >
        {(ordenes) => (
          <ul className="ordenes">
            {/* la fecha llega como texto ISO, se puede ordenar comparándola así */}
            {[...ordenes]
              .sort((a, b) => b.fecha.localeCompare(a.fecha))
              .map((orden) => (
                <li key={orden.id}>
                  <Link to={`/ordenes/${orden.id}`} className="orden-tarjeta">
                    <div>
                      <strong>Orden #{orden.id}</strong>
                      <p className="orden-tarjeta__fecha">{formatoFecha(orden.fecha)}</p>
                    </div>
                    <span className={`etiqueta etiqueta--${orden.estado.toLowerCase()}`}>
                      {TEXTO_ESTADO_ORDEN[orden.estado]}
                    </span>
                    <strong className="orden-tarjeta__total">{formatoMoneda(orden.total)}</strong>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </EstadoDatos>
    </section>
  );
}
