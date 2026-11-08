// la sesión del usuario, disponible para toda la aplicación.
// se usa con el hook useSesion() desde cualquier componente.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { borrarSesion, guardarSesion, leerUsuario } from '../../api/almacenSesion';
import { registrarAlExpirarSesion } from '../../api/cliente';
import type { Usuario } from '../../api/tipos';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { pedirRegistro, pedirSesion, type DatosRegistro } from './sesionServicio';

interface ValorSesion {
  usuario: Usuario | null;
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

  // cuando el servicio dice que la credencial ya no sirve (expiró o fue alterada),
  // el cliente de la api ya borró el token. aquí se quita el usuario y se avisa.
  useEffect(() => {
    registrarAlExpirarSesion(() => {
      setUsuario(null);
      mostrarAviso('Tu sesión terminó. Inicia sesión de nuevo.', 'error');
    });
  }, [mostrarAviso]);

  async function iniciarSesion(correo: string, contrasenia: string) {
    const sesion = await pedirSesion(correo, contrasenia);

    guardarSesion(sesion.token, sesion.usuario);
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
    <SesionContext value={{ usuario, iniciarSesion, registrarse, cerrarSesion }}>
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
