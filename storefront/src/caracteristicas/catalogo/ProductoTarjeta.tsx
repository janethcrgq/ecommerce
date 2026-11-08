// la tarjeta de un producto: foto, nombre y precio.
// toda la tarjeta es un enlace a la pantalla de detalle del producto.
import { Link } from 'react-router';
import type { Producto } from '../../api/tipos';
import { formatoMoneda, urlImagen } from '../../compartido/formato';

export function ProductoTarjeta({ producto }: { producto: Producto }) {
  return (
    <Link to={`/productos/${producto.id}`} className="tarjeta-producto">
      <div className="tarjeta-producto__imagen">
        <img src={urlImagen(producto.imagen)} alt={producto.nombre} loading="lazy" />
      </div>
      <div className="tarjeta-producto__datos">
        <h3 className="tarjeta-producto__nombre">{producto.nombre}</h3>
        <p className="tarjeta-producto__precio">{formatoMoneda(producto.precio)}</p>
      </div>
    </Link>
  );
}
