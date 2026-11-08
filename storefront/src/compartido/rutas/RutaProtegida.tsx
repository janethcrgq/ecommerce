// las rutas que van adentro de esta solo se ven con sesión iniciada.
// sin sesión manda a /entrar y guarda a dónde se quería ir, para regresar después.
import { Navigate, Outlet, useLocation } from 'react-router';
import { useSesion } from '../../caracteristicas/sesion/SesionContext';

export function RutaProtegida() {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return (
      <Navigate
        to="/entrar"
        replace
        state={{ desde: ubicacion.pathname + ubicacion.search }}
      />
    );
  }

  return <Outlet />;
}
