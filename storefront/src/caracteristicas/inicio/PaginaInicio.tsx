// la pantalla de inicio: una bienvenida y unos productos para empezar.
import { Link } from 'react-router';
import { EstadoDatos } from '../../compartido/componentes/EstadoDatos';
import { useDatos } from '../../compartido/hooks/useDatos';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { LEMA_TIENDA, NOMBRE_TIENDA } from '../../compartido/marca';
import { listarProductos } from '../catalogo/catalogoServicio';
import { ProductoTarjeta } from '../catalogo/ProductoTarjeta';

// cuántos productos se muestran en el inicio
const CANTIDAD_DESTACADOS = 4;

export default function PaginaInicio() {
  useTitulo();

  const { resultado, recargar } = useDatos(
    () => listarProductos({ ordenarPor: 'nombre' }),
    [],
  );

  return (
    <>
      <section className="hero">
        <div className="contenedor hero__contenido">
          <h1 className="hero__titulo">{NOMBRE_TIENDA}</h1>
          <p className="hero__texto">{LEMA_TIENDA}</p>
          <Link to="/productos" className="boton boton--grande boton--claro">
            Ver el catálogo
          </Link>
        </div>
      </section>

      <section className="contenedor pagina">
        <h2 className="pagina__titulo">Productos destacados</h2>

        <EstadoDatos
          resultado={resultado}
          alReintentar={recargar}
          estaVacio={(productos) => productos.length === 0}
          tituloVacio="Todavía no hay productos"
          textoVacio="Estamos preparando el catálogo. Vuelve pronto."
        >
          {(productos) => (
            <div className="rejilla">
              {productos.slice(0, CANTIDAD_DESTACADOS).map((producto) => (
                <ProductoTarjeta key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </EstadoDatos>
      </section>
    </>
  );
}
