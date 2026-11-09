import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Layout } from './compartido/layout/Layout';
import { RutaProtegida } from './compartido/rutas/RutaProtegida';

// cada pantalla se descarga solo cuando alguien la visita.
// lazy solo funciona con pantallas que usan `export default`.
const PaginaInicio = lazy(() => import('./caracteristicas/inicio/PaginaInicio'));
const PaginaCatalogo = lazy(() => import('./caracteristicas/catalogo/PaginaCatalogo'));
const PaginaProducto = lazy(() => import('./caracteristicas/catalogo/PaginaProducto'));
const PaginaCarrito = lazy(() => import('./caracteristicas/carrito/PaginaCarrito'));
const PaginaOrdenes = lazy(() => import('./caracteristicas/ordenes/PaginaOrdenes'));
const PaginaOrden = lazy(() => import('./caracteristicas/ordenes/PaginaOrden'));
const PaginaCompra =lazy(() => import('./caracteristicas/ordenes/PaginaCompra'));
const PaginaEntrar =lazy(() => import('./caracteristicas/sesion/PaginaEntrar'));
const PaginaRegistro = lazy(() => import('./caracteristicas/sesion/PaginaRegistro'));
const NoEncontrado = lazy(() => import('./compartido/paginas/NoEncontrado'));

export default function App() {
  return (
    <Routes>
      {/* todas las pantallas van dentro del Layout para compartir encabezado y pie */}
      <Route element={<Layout />}>
        <Route index element={<PaginaInicio />} />
        <Route path="productos" element={<PaginaCatalogo />} />
        <Route path="productos/:id" element={<PaginaProducto />} />
        <Route path="entrar" element={<PaginaEntrar />} />
        <Route path="registro" element={<PaginaRegistro />} />

        {/* estas pantallas solo se ven con sesión iniciada */}
        <Route element={<RutaProtegida />}>
          <Route path="carrito" element={<PaginaCarrito />} />
          <Route path="compra" element={<PaginaCompra />} />
          <Route path="ordenes" element={<PaginaOrdenes />} />
          <Route path="ordenes/:id" element={<PaginaOrden />} />
        </Route>

        {/* cualquier dirección que no coincide con nada */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
