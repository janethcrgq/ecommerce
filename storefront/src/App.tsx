import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './compartido/layout/Layout';

// cada pantalla se descarga solo cuando alguien la visita.
// lazy solo funciona con pantallas que usan `export default`.
const PaginaInicio = lazy(() => import('./caracteristicas/inicio/PaginaInicio'));
const PaginaEntrar = lazy(() => import('./caracteristicas/sesion/PaginaEntrar'));
const PaginaRegistro = lazy(() => import('./caracteristicas/sesion/PaginaRegistro'));
const NoEncontrado = lazy(() => import('./compartido/paginas/NoEncontrado'));

export default function App() {
  return (
    <Routes>
      {/* todas las pantallas van dentro del Layout para compartir encabezado y pie */}
      <Route element={<Layout />}>
        <Route index element={<PaginaInicio />} />
        <Route path="entrar" element={<PaginaEntrar />} />
        <Route path="registro" element={<PaginaRegistro />} />

        {/* cualquier dirección que no coincide con nada */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
