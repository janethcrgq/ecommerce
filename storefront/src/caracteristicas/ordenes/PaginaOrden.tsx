// el detalle de una orden: estado, piezas, pago y envío. tiene su propia dirección (/ordenes/:id).
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ErrorApi } from '../../api/errores';
import type { Envio, Pago } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { formatoFecha, formatoMoneda, urlImagen } from '../../compartido/formato';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import NoEncontrado from '../../compartido/paginas/NoEncontrado';
import { COLORES } from '../catalogo/colores';
import {
  ESTADOS_ORDEN,
  TEXTO_ESTADO_ORDEN,
  TEXTO_ESTADO_PAGO,
  TEXTO_METODO_PAGO,
} from './etiquetas';
import { obtenerOrden, pagarOrden } from './ordenesServicio';

export default function PaginaOrden() {
  const { id } = useParams();
  const idOrden = Number(id);

  if (!Number.isInteger(idOrden) || idOrden <= 0) {
    return <NoEncontrado />;
  }

  return <DetalleOrden idOrden={idOrden} />;
}


function DetalleOrden({ idOrden }: { idOrden: number }) {
  const { resultado, recargar } = useDatos(() => obtenerOrden(idOrden), [idOrden]);

  useTitulo(`Orden #${idOrden}`);

  if (resultado.tipo === 'error' && resultado.error.estado === 404) {
    return <NoEncontrado />;
  }

  return (
    <section className="contenedor pagina">
      <Link to="/ordenes" className="enlace-volver">
        ← Volver a mis órdenes
      </Link>

      <EstadoDatos resultado={resultado} alReintentar={recargar}>
        {({ orden, detalles, pago, envio }) => (
          <>
            <h1 className="pagina__titulo">Orden #{orden.id}</h1>
            <p className="orden__fecha">Hecha el {formatoFecha(orden.fecha)}</p>

            <Progreso estado={orden.estado} />

            <div className="carrito">
              <ul className="carrito__lista">
                {detalles.map((d) => (
                  <li key={d.id} className="carrito__item carrito__item--simple">
                    <Link to={`/productos/${d.productoId}`} className="carrito__imagen">
                      <img src={urlImagen(d.imagen)} alt={d.nombre} loading="lazy" />
                    </Link>
                    <div className="carrito__datos">
                      <Link to={`/productos/${d.productoId}`} className="carrito__nombre">
                        {d.nombre}
                      </Link>
                      <p className="carrito__detalle">
                        Talla {d.talla} · {COLORES[d.color].nombre} · {d.cantidad} ×{' '}
                        {formatoMoneda(d.precioUnitario)}
                      </p>
                    </div>
                    <p className="carrito__subtotal">{formatoMoneda(d.subtotal)}</p>
                  </li>
                ))}
              </ul>

              <aside>
                <div className="carrito__resumen">
                  <p className="carrito__total">
                    <span>Total</span>
                    <strong>{formatoMoneda(orden.total)}</strong>
                  </p>
                </div>
                <BloquePago pagoInicial={pago} idOrden={orden.id} />
                <BloqueEnvio envio={envio} />
              </aside>
            </div>
          </>
        )}
      </EstadoDatos>
    </section>
  );
}


// los 4 pasos de la orden, marcando hasta cuál va
function Progreso({ estado }: { estado: (typeof ESTADOS_ORDEN)[number] }) {
  const actual = ESTADOS_ORDEN.indexOf(estado);

  return (
    <ol className="progreso" aria-label="Estado de la orden">
      {ESTADOS_ORDEN.map((e, posicion) => (
        <li
          key={e}
          className={posicion <= actual ? 'progreso__paso progreso__paso--hecho' : 'progreso__paso'}
          aria-current={posicion === actual ? 'step' : undefined}
        >
          {TEXTO_ESTADO_ORDEN[e]}
        </li>
      ))}
    </ol>
  );
}


function BloquePago({ pagoInicial, idOrden }: { pagoInicial: Pago | null; idOrden: number }) {
  const { mostrarAviso } = useAvisos();
  const [pago, setPago] = useState(pagoInicial);
  const [pagando, setPagando] = useState(false);

  async function alPagar() {
    setPagando(true);
    try {
      setPago(await pagarOrden(idOrden));
      mostrarAviso('Pago realizado. ¡Gracias por tu compra!', 'exito');
    } catch (error) {
      mostrarAviso(error instanceof ErrorApi ? error.message : 'No se pudo pagar la orden.', 'error');
    } finally {
      setPagando(false);
    }
  }

  return (
    <div className="carrito__resumen bloque">
      <h2>Pago</h2>
      {pago ? (
        <>
          <p>
            {TEXTO_METODO_PAGO[pago.metodo]} · {formatoMoneda(pago.monto)}
            <br />
            <span className={`etiqueta etiqueta--pago-${pago.estado.toLowerCase()}`}>
              {TEXTO_ESTADO_PAGO[pago.estado]}
            </span>
          </p>
          {pago.estado !== 'PAGADO' && (
            <button type="button" className="boton boton--bloque" onClick={alPagar} disabled={pagando}>
              {pagando ? 'Pagando...' : 'Pagar ahora'}
            </button>
          )}
        </>
      ) : (
        <p>Esta orden no tiene un pago registrado.</p>
      )}
    </div>
  );
}


function BloqueEnvio({ envio }: { envio: Envio | null }) {
  return (
    <div className="carrito__resumen bloque">
      <h2>Envío</h2>
      {envio ? (
        <p>
          {envio.nombrePaqueteria}
          <br />
          Guía: <strong>{envio.numeroGuia}</strong>
          <br />
          Enviado el {formatoFecha(envio.fechaEnvio)}
          {envio.fechaEntrega && (
            <>
              <br />
              Entregado el {formatoFecha(envio.fechaEntrega)}
            </>
          )}
        </p>
      ) : (
        <p>Todavía no tiene un envío registrado. Te mostraremos la guía cuando salga.</p>
      )}
    </div>
  );
}
