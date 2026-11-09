import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import { ProveedorCarrito } from './caracteristicas/carrito/CarritoContext';
import { ProveedorSesion } from './caracteristicas/sesion/SesionContext';
import { ProveedorAvisos } from './compartido/avisos/AvisosContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* el router permite navegar sin recargar la página */}
    <BrowserRouter>
      {/* los avisos van afuera de la sesión porque la sesión los usa */}
      <ProveedorAvisos>
        {/* con este proveedor, todos los componentes pueden leer la sesión */}
        <ProveedorSesion>
          {/* el carrito depende de quién tiene la sesión, por eso va adentro */}
          <ProveedorCarrito>
            <App />
          </ProveedorCarrito>
        </ProveedorSesion>
      </ProveedorAvisos>
    </BrowserRouter>
  </StrictMode>,
);
