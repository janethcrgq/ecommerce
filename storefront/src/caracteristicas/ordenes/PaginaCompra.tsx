// la compra (checkout): elegir dirección y forma de pago, revisar el resumen y confirmar.
// al confirmar se muestra el resultado y se puede pagar la orden.
import { useState } from 'react';
import { Link } from 'react-router';
import { ErrorApi } from '../../api/errores';
import type { CarritoDetalle, Direccion, MetodoPago, Pago } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { EstadoVacio } from '../../compartido/componentes/EstadoVacio';
import { formatoMoneda, urlImagen } from '../../compartido/formato';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { COLORES } from '../catalogo/colores';
import { useCarrito } from '../carrito/CarritoContext';
import { FormularioDireccion } from '../direcciones/FormularioDireccion';
import { listarDirecciones } from '../direcciones/direccionesServicio';
import { useSesion } from '../sesion/SesionContext';
import { confirmarCompra, pagarOrden, type ResultadoCompra } from './ordenesServicio';

const METODOS_PAGO: { valor: MetodoPago; texto: string }[] = [
  { valor: 'TARJETA', texto: 'Tarjeta' },
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
];

export default function PaginaCompra() {
  useTitulo('Finalizar compra');

  const { usuario } = useSesion();
  const { resultado, recargar } = useCarrito();

  // cuando la compra se confirma se guarda aquí lo que respondió el servicio
  const [compra, setCompra] = useState<ResultadoCompra | null>(null);

  if (usuario?.rol !== 'CLIENTE') {
    return (
      <section className="contenedor pagina">
        <EstadoVacio
          titulo="Esta cuenta no puede comprar"
          texto="Solo las cuentas de cliente pueden hacer compras."
          accion={<Link to="/productos" className="boton">Ver el catálogo</Link>}
        />
      </section>
    );
  }

  if (compra) {
    return (
      <section className="contenedor pagina">
        <CompraConfirmada compra={compra} />
      </section>
    );
  }

  return (
    <section className="contenedor pagina">
      <h1 className="pagina__titulo">Finalizar compra</h1>

      <EstadoDatos
        resultado={resultado}
        alReintentar={recargar}
        estaVacio={(carrito) => carrito.items.length === 0}
        tituloVacio="Tu carrito está vacío"
        textoVacio="Agrega algo antes de comprar."
        accionVacia={<Link to="/productos" className="boton">Ver el catálogo</Link>}
      >
        {(carrito) => (
          <Compra
            carrito={carrito}
            alConfirmar={(resultadoCompra) => {
              setCompra(resultadoCompra);
              // el servicio ya vació el carrito, se actualiza el contador del encabezado
              recargar();
            }}
          />
        )}
      </EstadoDatos>
    </section>
  );
}


interface CompraProps {
  carrito: CarritoDetalle;
  alConfirmar: (resultado: ResultadoCompra) => void;
}

function Compra({ carrito, alConfirmar }: CompraProps) {
  const direcciones = useDatos(listarDirecciones, []);

  const [direccionElegida, setDireccionElegida] = useState<number | null>(null);
  const [agregandoDireccion, setAgregandoDireccion] = useState(false);
  const [metodo, setMetodo] = useState<MetodoPago>('TARJETA');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // mientras no se elija una, queda seleccionada la primera
  const lista = direcciones.resultado.tipo === 'listo' ? direcciones.resultado.datos : [];
  const idDireccion = direccionElegida ?? lista[0]?.id ?? null;

  function alGuardarDireccion(direccion: Direccion) {
    setDireccionElegida(direccion.id);
    setAgregandoDireccion(false);
    direcciones.recargar();
  }

  async function alConfirmarCompra() {
    setError(null);

    if (idDireccion === null) {
      setError('Elige o agrega una dirección de envío.');
      return;
    }

    setEnviando(true);
    try {
      alConfirmar(await confirmarCompra(idDireccion, metodo));
    } catch (e) {
      // por ejemplo, si alguien más compró las últimas piezas mientras tanto
      setError(e instanceof ErrorApi ? e.message : 'No se pudo confirmar la compra.');
      setEnviando(false);
    }
  }

  return (
    <div className="carrito">
      <div>
        <div className="paso">
          <h2 className="paso__titulo">1. Dirección de envío</h2>

          <EstadoDatos resultado={direcciones.resultado} alReintentar={direcciones.recargar}>
            {(guardadas) =>
              guardadas.length === 0 || agregandoDireccion ? (
                <>
                  {guardadas.length === 0 && <p>Todavía no tienes direcciones. Agrega una para continuar.</p>}
                  <FormularioDireccion
                    alGuardar={alGuardarDireccion}
                    alCancelar={guardadas.length > 0 ? () => setAgregandoDireccion(false) : undefined}
                  />
                </>
              ) : (
                <>
                  <div className="opciones-lista" role="radiogroup" aria-label="Dirección de envío">
                    {guardadas.map((d) => (
                      <label
                        key={d.id}
                        className={d.id === idDireccion ? 'opcion opcion--elegida' : 'opcion'}
                      >
                        <input
                          type="radio"
                          name="direccion"
                          checked={d.id === idDireccion}
                          onChange={() => setDireccionElegida(d.id)}
                        />
                        <span>
                          {d.calle} {d.numeroCasa}, {d.colonia}
                          <br />
                          {d.ciudad}, {d.estado}. CP {d.codigoPostal}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="boton boton--secundario boton--pequeno"
                    onClick={() => setAgregandoDireccion(true)}
                  >
                    Agregar otra dirección
                  </button>
                </>
              )
            }
          </EstadoDatos>
        </div>

        <div className="paso">
          <h2 className="paso__titulo">2. Forma de pago</h2>
          <div className="opciones-lista" role="radiogroup" aria-label="Forma de pago">
            {METODOS_PAGO.map((m) => (
              <label key={m.valor} className={m.valor === metodo ? 'opcion opcion--elegida' : 'opcion'}>
                <input
                  type="radio"
                  name="metodo"
                  checked={m.valor === metodo}
                  onChange={() => setMetodo(m.valor)}
                />
                <span>{m.texto}</span>
              </label>
            ))}
          </div>
          <p className="paso__nota">El pago es una simulación: no se cobra nada real.</p>
        </div>
      </div>

      <aside className="carrito__resumen">
        <h2>Resumen</h2>
        <ul className="resumen__lista">
          {carrito.items.map((item) => (
            <li key={item.varianteId} className="resumen__item">
              <img src={urlImagen(item.imagen)} alt="" />
              <span>
                {item.nombre}
                <small>
                  {' '}Talla {item.talla}, {COLORES[item.color].nombre} × {item.cantidad}
                </small>
              </span>
              <strong>{formatoMoneda(item.subtotal)}</strong>
            </li>
          ))}
        </ul>

        <p className="carrito__total">
          <span>Total</span>
          <strong>{formatoMoneda(carrito.total)}</strong>
        </p>

        {error && (
          <p className="formulario__error" role="alert">
            {error} <Link to="/carrito">Revisar mi carrito</Link>
          </p>
        )}

        <button
          type="button"
          className="boton boton--grande boton--bloque"
          onClick={alConfirmarCompra}
          disabled={enviando}
        >
          {enviando ? 'Confirmando...' : 'Confirmar compra'}
        </button>
        <Link to="/carrito" className="boton boton--secundario boton--bloque">
          Volver al carrito
        </Link>
      </aside>
    </div>
  );
}


// lo que se ve después de confirmar: el número de orden y la opción de pagar
function CompraConfirmada({ compra }: { compra: ResultadoCompra }) {
  const { mostrarAviso } = useAvisos();
  const [pago, setPago] = useState<Pago>(compra.pago);
  const [pagando, setPagando] = useState(false);

  async function alPagar() {
    setPagando(true);
    try {
      setPago(await pagarOrden(compra.orden.id));
      mostrarAviso('Pago realizado. ¡Gracias por tu compra!', 'exito');
    } catch (error) {
      mostrarAviso(error instanceof ErrorApi ? error.message : 'No se pudo pagar la orden.', 'error');
    } finally {
      setPagando(false);
    }
  }

  const pagada = pago.estado === 'PAGADO';

  return (
    <div className="estado">
      <p className="estado__codigo">✓</p>
      <h1 className="estado__titulo">¡Tu orden #{compra.orden.id} está confirmada!</h1>
      <p className="estado__texto">
        Total: <strong>{formatoMoneda(compra.orden.total)}</strong>
        <br />
        {pagada ? 'El pago ya está registrado.' : 'Falta pagar tu orden para que la preparemos.'}
      </p>

      {!pagada && (
        <button type="button" className="boton boton--grande" onClick={alPagar} disabled={pagando}>
          {pagando ? 'Pagando...' : 'Pagar ahora'}
        </button>
      )}

      <p>
        <Link to="/ordenes">Ver mis órdenes</Link> · <Link to="/productos">Seguir comprando</Link>
      </p>
    </div>
  );
}
