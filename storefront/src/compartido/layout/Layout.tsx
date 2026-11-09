// el marco que comparten todas las pantallas: encabezado arriba, pie abajo
// y en medio el <Outlet />, que es el hueco donde react-router pinta la pantalla
// que corresponde a la dirección. así el encabezado y el pie no se repiten.
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Cargando } from '../componentes/Cargando';
import { AvisoSinConexion } from './AvisoSinConexion';
import { Encabezado } from './Encabezado';
import { PiePagina } from './PiePagina';

export function Layout() {
  const { pathname } = useLocation();

  // al cambiar de pantalla se regresa hasta arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="disposicion">
      <AvisoSinConexion />
      <Encabezado />
      <main className="disposicion__contenido">
        {/* mientras se baja el código de la pantalla se ve Cargando, sin mover el encabezado ni el pie */}
        <Suspense fallback={<Cargando />}>
          <Outlet />
        </Suspense>
      </main>
      <PiePagina />
    </div>
  );
}
