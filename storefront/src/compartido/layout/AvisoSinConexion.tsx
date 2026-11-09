// una franja arriba de todo que avisa cuando el servicio no responde.
// se quita sola cuando una petición vuelve a llegar bien.
import { useEffect, useState } from 'react';
import { registrarAlCambiarConexion } from '../../api/cliente';
import { listarCategorias } from '../../caracteristicas/catalogo/catalogoServicio';

export function AvisoSinConexion() {
  const [hayConexion, setHayConexion] = useState(true);
  const [probando, setProbando] = useState(false);

  useEffect(() => {
    registrarAlCambiarConexion(setHayConexion);
  }, []);

  // hace una petición ligera  y si llega, el cliente de la api quita el aviso solo
  async function probar() {
    setProbando(true);
    try {
      await listarCategorias();
    } catch {
      // si sigue sin conexión el aviso se queda
    } finally {
      setProbando(false);
    }
  }

  if (hayConexion) return null;

  return (
    <div className="sin-conexion" role="alert">
      <div className="contenedor sin-conexion__contenido">
        <span>
          No pudimos conectar con la tienda. Puede que no tengas internet o que el servicio esté apagado.
        </span>
        <button type="button" className="boton boton--claro boton--pequeno" onClick={probar} disabled={probando}>
          {probando ? 'Probando...' : 'Reintentar'}
        </button>
      </div>
    </div>
  );
}
