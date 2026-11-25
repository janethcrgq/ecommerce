// la sesión del usuario, disponible para toda la aplicación.
// se usa con el hook useSesion() desde cualquier componente.
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { borrarSesion, guardarSesion, leerUsuario } from '../../api/almacenSesion';
import { registrarAlExpirarSesion } from '../../api/cliente';
import type { Usuario } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { pedirRegistro, pedirSesion, type DatosRegistro } from './sesionServicio';

interface ValorSesion {
  usuario: Usuario | null;
  // true cuando la sesión terminó sola (la credencial ya no servía)
  sesionExpirada: boolean;
  iniciarSesion: (correo: string, contrasenia: string) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => void;
}

const SesionContext = createContext<ValorSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const { mostrarAviso } = useAvisos();

  // al abrir la página se busca si ya había un usuario guardado, así la sesión
  // no se pierde al recargar
  const [usuario, setUsuario] = useState<Usuario | null>(leerUsuario);
  const [sesionExpirada, setSesionExpirada] = useState(false);

  // varias peticiones pueden recibir el 401 al mismo tiempo, con esto el aviso sale una sola vez
  const avisoDado = useRef(false);

  // cuando el servicio dice que la credencial ya no sirve (expiró o fue alterada),
  // el cliente de la api ya borró el token. aquí se quita el usuario y se avisa.
  useEffect(() => {
    registrarAlExpirarSesion(() => {
      if (avisoDado.current) return;
      avisoDado.current = true;

      setUsuario(null);
      setSesionExpirada(true);
      mostrarAviso('Tu sesión terminó. Inicia sesión de nuevo.', 'error');
    });
  }, [mostrarAviso]);

  // la sesión se guarda en localStorage, que comparten todas las pestañas del mismo navegador.
  // si en otra pestaña alguien inicia o cierra sesión, esta se entera y se actualiza,
  // para no seguir mostrando a un usuario que ya no es el de la sesión guardada
  useEffect(() => {
    function alCambiarAlmacen() {
      setUsuario(leerUsuario());
    }

    window.addEventListener('storage', alCambiarAlmacen);
    return () => window.removeEventListener('storage', alCambiarAlmacen);
  }, []);

  async function iniciarSesion(correo: string, contrasenia: string) {
    const sesion = await pedirSesion(correo, contrasenia);

    guardarSesion(sesion.token, sesion.usuario);
    avisoDado.current = false;
    setSesionExpirada(false);
    setUsuario(sesion.usuario);
  }

  // al registrarse se inicia sesión de una vez, para no pedir los datos otra vez
  async function registrarse(datos: DatosRegistro) {
    await pedirRegistro(datos);
    await iniciarSesion(datos.correo, datos.contrasenia);
  }

  function cerrarSesion() {
    borrarSesion();
    setUsuario(null);
    mostrarAviso('Cerraste sesión.', 'info');
  }

  return (
    <SesionContext value={{ usuario, sesionExpirada, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </SesionContext>
  );
}

// el hook para leer la sesión. si se usa fuera del proveedor, avisa con un error
export function useSesion() {
  const valor = useContext(SesionContext);

  if (!valor) {
    throw new Error('useSesion() tiene que usarse dentro del componente <ProveedorSesion>');
  }

  return valor;
}
