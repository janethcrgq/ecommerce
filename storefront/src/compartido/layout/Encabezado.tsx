// el encabezado que se ve en todas las pantallas.
// los enlaces cambian según haya sesión o no, pero eso solo acomoda lo que se ve:
// la protección de verdad la hace el servicio.
import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useSesion } from '../../caracteristicas/sesion/SesionContext';
import { NOMBRE_TIENDA } from '../marca';

export function Encabezado() {
  const { usuario, cerrarSesion } = useSesion();

  // en el celular el menú se abre y se cierra con un botón
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarMenu = () => setMenuAbierto(false);

  const esCliente = usuario?.rol === 'CLIENTE';

  return (
    <header className="encabezado">
      <div className="contenedor encabezado__barra">
        <Link to="/" className="encabezado__marca" onClick={cerrarMenu}>
          {NOMBRE_TIENDA}
        </Link>

        <button
          className="encabezado__boton-menu"
          aria-expanded={menuAbierto}
          aria-controls="menu-principal"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          {menuAbierto ? 'Cerrar' : 'Menú'}
        </button>

        <nav
          id="menu-principal"
          className={menuAbierto ? 'encabezado__nav encabezado__nav--abierto' : 'encabezado__nav'}
        >
          <NavLink to="/productos" onClick={cerrarMenu}>Catálogo</NavLink>

          {esCliente && (
            <>
              <NavLink to="/carrito" onClick={cerrarMenu}>Carrito</NavLink>
              <NavLink to="/ordenes" onClick={cerrarMenu}>Mis órdenes</NavLink>
            </>
          )}

          {usuario ? (
            <>
              <span className="encabezado__saludo">Hola, {usuario.nombre.split(' ')[0]}</span>
              <button
                className="boton boton--secundario boton--pequeno"
                onClick={() => {
                  cerrarMenu();
                  cerrarSesion();
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/entrar" onClick={cerrarMenu}>Entrar</NavLink>
              <Link to="/registro" className="boton boton--pequeno" onClick={cerrarMenu}>
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
