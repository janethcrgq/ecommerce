// la pantalla del carrito: las piezas elegidas, cambiar cantidades, quitar y seguir a la compra.
import { useState } from 'react';
import { Link } from 'react-router';
import { ErrorApi } from '../../api/errores';
import type { ItemCarritoDetalle } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { formatoMoneda, urlImagen } from '../../compartido/formato';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { EstadoVacio } from '../../compartido/componentes/EstadoVacio';
import { COLORES } from '../catalogo/colores';
import { useSesion } from '../sesion/SesionContext';
import { useCarrito } from './CarritoContext';

export default function PaginaCarrito() {
  useTitulo('Mi carrito');

  const { resultado, recargar, cambiarCantidad, quitar, vaciar } = useCarrito();
  const { mostrarAviso } = useAvisos();
  const { usuario } = useSesion();

  // mientras se guarda un cambio se bloquean los botones, para no mandar dos a la vez
  const [ocupado, setOcupado] = useState(false);

  async function hacer(accion: () => Promise<void>) {
    setOcupado(true);
    try {
      await accion();
    } catch (error) {
      mostrarAviso(error instanceof ErrorApi ? error.message : 'No se pudo hacer el cambio.', 'error');
    } finally {
      setOcupado(false);
    }
  }

  // el carrito es solo de los clientes; al administrador el servicio le diría que no
  if (usuario?.rol !== 'CLIENTE') {
    return (
      <section className="contenedor pagina">
        <EstadoVacio
          titulo="Esta cuenta no tiene carrito"
          texto="Solo las cuentas de cliente pueden hacer compras."
          accion={<Link to="/productos" className="boton">Ver el catálogo</Link>}
        />
      </section>
    );
  }

  function alVaciar() {
    if (window.confirm('¿Seguro que quieres vaciar el carrito?')) {
      hacer(vaciar);
    }
  }

  return (
    <section className="contenedor pagina">
      <h1 className="pagina__titulo">Mi carrito</h1>

      <EstadoDatos
        resultado={resultado}
        alReintentar={recargar}
        estaVacio={(carrito) => carrito.items.length === 0}
        tituloVacio="Tu carrito está vacío"
        textoVacio="Cuando agregues productos los verás aquí."
        accionVacia={
          <Link to="/productos" className="boton">
            Ver el catálogo
          </Link>
        }
      >
        {(carrito) => (
          <div className="carrito">
            <ul className="carrito__lista">
              {carrito.items.map((item) => (
                <FilaCarrito
                  key={item.varianteId}
                  item={item}
                  ocupado={ocupado}
                  alCambiar={(cantidad) => hacer(() => cambiarCantidad(item.varianteId, cantidad))}
                  alQuitar={() => hacer(() => quitar(item.varianteId))}
                />
              ))}
            </ul>

            <aside className="carrito__resumen">
              <h2>Resumen</h2>
              <p className="carrito__total">
                <span>Total</span>
                <strong>{formatoMoneda(carrito.total)}</strong>
              </p>
              <Link to="/compra" className="boton boton--grande boton--bloque">
                Continuar con la compra
              </Link>
              <button
                type="button"
                className="boton boton--secundario boton--bloque"
                onClick={alVaciar}
                disabled={ocupado}
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </EstadoDatos>
    </section>
  );
}


interface FilaCarritoProps {
  item: ItemCarritoDetalle;
  ocupado: boolean;
  alCambiar: (cantidad: number) => void;
  alQuitar: () => void;
}

function FilaCarrito({ item, ocupado, alCambiar, alQuitar }: FilaCarritoProps) {
  return (
    <li className="carrito__item">
      <Link to={`/productos/${item.productoId}`} className="carrito__imagen">
        <img src={urlImagen(item.imagen)} alt={item.nombre} loading="lazy" />
      </Link>

      <div className="carrito__datos">
        <Link to={`/productos/${item.productoId}`} className="carrito__nombre">
          {item.nombre}
        </Link>
        <p className="carrito__detalle">
          Talla {item.talla} · {COLORES[item.color].nombre} · {formatoMoneda(item.precioUnitario)} c/u
        </p>

        <div className="carrito__acciones">
          <div className="cantidad">
            <button
              type="button"
              className="cantidad__boton"
              onClick={() => alCambiar(item.cantidad - 1)}
              disabled={ocupado || item.cantidad <= 1}
              aria-label="Una pieza menos"
            >
              −
            </button>
            <span className="cantidad__numero">{item.cantidad}</span>
            <button
              type="button"
              className="cantidad__boton"
              onClick={() => alCambiar(item.cantidad + 1)}
              disabled={ocupado || item.cantidad >= item.stockDisponible}
              aria-label="Una pieza más"
            >
              +
            </button>
          </div>

          <button type="button" className="carrito__quitar" onClick={alQuitar} disabled={ocupado}>
            Quitar
          </button>
        </div>
      </div>

      <p className="carrito__subtotal">{formatoMoneda(item.subtotal)}</p>
    </li>
  );
}
