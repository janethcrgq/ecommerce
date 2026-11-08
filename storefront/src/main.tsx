import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
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
          <App />
        </ProveedorSesion>
      </ProveedorAvisos>
    </BrowserRouter>
  </StrictMode>,
);
