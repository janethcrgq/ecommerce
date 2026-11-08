// la pantalla para iniciar sesión.
import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ErrorApi } from '../../api/errores';
import { Campo } from '../../compartido/componentes/Campo';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { useSesion } from './SesionContext';
import { validarCorreo } from './validaciones';

interface ErroresEntrar {
  correo?: string | null;
  contrasenia?: string | null;
}

export default function PaginaEntrar() {
  useTitulo('Iniciar sesión');

  const { usuario, iniciarSesion } = useSesion();
  const { mostrarAviso } = useAvisos();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [errores, setErrores] = useState<ErroresEntrar>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // la ruta protegida guarda a dónde se quería ir. si no hay nada, se va al inicio
  const destino: string = ubicacion.state?.desde ?? '/';

  // si ya hay sesión no tiene caso ver el formulario
  if (usuario) {
    return <Navigate to={destino} replace />;
  }

  async function alEnviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);

    const nuevosErrores = {
      correo: validarCorreo(correo),
      contrasenia: contrasenia === '' ? 'Escribe tu contraseña.' : null,
    };
    setErrores(nuevosErrores);

    if (nuevosErrores.correo || nuevosErrores.contrasenia) return;

    setEnviando(true);
    try {
      await iniciarSesion(correo.trim(), contrasenia);
      mostrarAviso('Bienvenido de nuevo.', 'exito');
      navegar(destino, { replace: true });
    } catch (error) {
      setErrorGeneral(error instanceof ErrorApi ? error.message : 'No se pudo iniciar sesión.');
      setEnviando(false);
    }
  }

  return (
    <section className="contenedor pagina">
      <div className="formulario">
        <h1 className="pagina__titulo">Iniciar sesión</h1>

        {/* si venía de una ruta protegida se explica por qué está aquí */}
        {ubicacion.state?.desde && (
          <p className="formulario__nota">Inicia sesión para continuar con tu compra.</p>
        )}

        <form onSubmit={alEnviar} noValidate>
          <Campo
            etiqueta="Correo"
            name="correo"
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            error={errores.correo}
          />
          <Campo
            etiqueta="Contraseña"
            name="contrasenia"
            type="password"
            autoComplete="current-password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            error={errores.contrasenia}
          />

          {errorGeneral && (
            <p className="formulario__error" role="alert">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="boton boton--bloque" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="formulario__pie">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" state={ubicacion.state}>
            Regístrate
          </Link>
        </p>
      </div>
    </section>
  );
}
