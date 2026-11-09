// el detalle de un producto: foto, descripción y elegir color, talla y cantidad.
// tiene su propia dirección (/productos/:id).
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { ErrorApi } from '../../api/errores';
import type { Color, Talla, Variante } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { formatoMoneda, urlImagen } from '../../compartido/formato';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import NoEncontrado from '../../compartido/paginas/NoEncontrado';
import { useCarrito } from '../carrito/CarritoContext';
import { useSesion } from '../sesion/SesionContext';
import { obtenerProducto } from './catalogoServicio';
import { COLORES } from './colores';

const TALLAS: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// cuántas piezas quedan para avisar que ya son pocas
const POCAS_PIEZAS = 5;

export default function PaginaProducto() {
  const { id } = useParams();
  const idProducto = Number(id);

  // si la dirección trae algo que no es un número, no existe tal producto
  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    return <NoEncontrado />;
  }

  return <DetalleProducto idProducto={idProducto} />;
}


function DetalleProducto({ idProducto }: { idProducto: number }) {
  const { resultado, recargar } = useDatos(() => obtenerProducto(idProducto), [idProducto]);

  useTitulo(resultado.tipo === 'listo' ? resultado.datos.producto.nombre : 'Producto');

  // un producto que no existe (o que ya no se vende) se ve como página no encontrada
  if (resultado.tipo === 'error' && resultado.error.estado === 404) {
    return <NoEncontrado />;
  }

  return (
    <section className="contenedor pagina">
      <Link to="/productos" className="enlace-volver">
        ← Volver al catálogo
      </Link>

      <EstadoDatos resultado={resultado} alReintentar={recargar}>
        {({ producto, variantes }) => (
          <div className="detalle">
            <div className="detalle__imagen">
              <img src={urlImagen(producto.imagen)} alt={producto.nombre} />
            </div>

            <div className="detalle__datos">
              <h1 className="detalle__nombre">{producto.nombre}</h1>
              <p className="detalle__precio">{formatoMoneda(producto.precio)}</p>
              <p>{producto.descripcion}</p>

              <Opciones variantes={variantes} />
            </div>
          </div>
        )}
      </EstadoDatos>
    </section>
  );
}


// elegir color, talla y cantidad, y agregar al carrito
function Opciones({ variantes }: { variantes: Variante[] }) {
  const { usuario } = useSesion();
  const { agregar } = useCarrito();
  const { mostrarAviso } = useAvisos();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  // los colores que existen para este producto, sin repetir
  const colores = [...new Set(variantes.map((v) => v.color))];

  const [color, setColor] = useState<Color | null>(
    // se empieza en el primer color que tenga piezas
    colores.find((c) => variantes.some((v) => v.color === c && v.stock > 0)) ?? null,
  );
  const [talla, setTalla] = useState<Talla | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);

  const variantesDelColor = variantes.filter((v) => v.color === color);
  const varianteElegida = variantesDelColor.find((v) => v.talla === talla) ?? null;

  const hayPiezas = variantes.some((v) => v.stock > 0);

  function elegirColor(nuevoColor: Color) {
    setColor(nuevoColor);
    setError(null);

    // si la talla elegida no existe o está agotada en el color nuevo, se quita
    const sigueDisponible = variantes.some(
      (v) => v.color === nuevoColor && v.talla === talla && v.stock > 0,
    );
    if (!sigueDisponible) setTalla(null);
    setCantidad(1);
  }

  function elegirTalla(nuevaTalla: Talla) {
    setTalla(nuevaTalla);
    setError(null);
    setCantidad(1);
  }

  async function alAgregar() {
    setError(null);

    if (!usuario) {
      // sin sesión se manda a entrar y después se regresa a este producto
      navegar('/entrar', { state: { desde: ubicacion.pathname } });
      return;
    }

    if (!varianteElegida) {
      setError('Elige una talla para continuar.');
      return;
    }

    setAgregando(true);
    try {
      await agregar(varianteElegida.id, cantidad);
      mostrarAviso('Agregado al carrito.', 'exito');
    } catch (e) {
      // por ejemplo, si no alcanzan las piezas: el mensaje ya viene en lenguaje normal
      setError(e instanceof ErrorApi ? e.message : 'No se pudo agregar al carrito.');
    } finally {
      setAgregando(false);
    }
  }

  if (!hayPiezas) {
    return <p className="detalle__agotado">Este producto está agotado por ahora.</p>;
  }

  // el administrador no compra, así que no se le muestra el botón
  const esAdministrador = usuario?.rol === 'ADMINISTRADOR';

  return (
    <div className="opciones">
      <div className="opciones__grupo">
        <p className="opciones__titulo">
          Color: <strong>{color ? COLORES[color].nombre : 'elige uno'}</strong>
        </p>
        {/* si el producto solo viene en un color, no hay nada que elegir */}
        <div className="opciones__lista">
          {colores.length > 1 && colores.map((c) => {
            const agotado = !variantes.some((v) => v.color === c && v.stock > 0);

            return (
              <button
                key={c}
                type="button"
                className={c === color ? 'color color--elegido' : 'color'}
                style={{ background: COLORES[c].css }}
                onClick={() => elegirColor(c)}
                disabled={agotado}
                aria-label={agotado ? `${COLORES[c].nombre} (agotado)` : COLORES[c].nombre}
                aria-pressed={c === color}
                title={agotado ? `${COLORES[c].nombre} (agotado)` : COLORES[c].nombre}
              />
            );
          })}
        </div>
      </div>

      <div className="opciones__grupo">
        <p className="opciones__titulo">
          Talla: <strong>{talla ?? 'elige una'}</strong>
        </p>
        <div className="opciones__lista">
          {TALLAS.map((t) => {
            const variante = variantesDelColor.find((v) => v.talla === t);

            // solo se muestran las tallas que existen en ese color
            if (!variante) return null;

            return (
              <button
                key={t}
                type="button"
                className={t === talla ? 'talla talla--elegida' : 'talla'}
                onClick={() => elegirTalla(t)}
                disabled={variante.stock === 0}
                aria-pressed={t === talla}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {varianteElegida && (
        <p className={varianteElegida.stock <= POCAS_PIEZAS ? 'stock stock--poco' : 'stock'}>
          {varianteElegida.stock <= POCAS_PIEZAS
            ? `¡Quedan solo ${varianteElegida.stock}!`
            : 'Disponible'}
        </p>
      )}

      {varianteElegida && (
        <div className="opciones__grupo">
          <p className="opciones__titulo">Cantidad</p>
          <div className="cantidad">
            <button
              type="button"
              className="cantidad__boton"
              onClick={() => setCantidad(cantidad - 1)}
              disabled={cantidad <= 1}
              aria-label="Una pieza menos"
            >
              −
            </button>
            <span className="cantidad__numero" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              className="cantidad__boton"
              onClick={() => setCantidad(cantidad + 1)}
              disabled={cantidad >= varianteElegida.stock}
              aria-label="Una pieza más"
            >
              +
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="formulario__error" role="alert">
          {error}
        </p>
      )}

      {esAdministrador ? (
        <p className="formulario__nota">Con una cuenta de administrador no se pueden hacer compras.</p>
      ) : (
        <button
          type="button"
          className="boton boton--grande boton--bloque"
          onClick={alAgregar}
          disabled={agregando}
        >
          {agregando ? 'Agregando...' : usuario ? 'Agregar al carrito' : 'Inicia sesión para comprar'}
        </button>
      )}
    </div>
  );
}
