// la pantalla para crear una cuenta de cliente.
import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ErrorApi } from '../../api/errores';
import { Campo } from '../../compartido/componentes/Campo';
import { useAvisos } from '../../compartido/avisos/AvisosContext';
import { useTitulo } from '../../compartido/hooks/useTitulo';
import { useSesion } from './SesionContext';
import {
  validarContrasenia,
  validarCorreo,
  validarNombre,
  validarTelefono,
} from './validaciones';

interface ErroresRegistro {
  nombre?: string | null;
  correo?: string | null;
  contrasenia?: string | null;
  telefono?: string | null;
}

export default function PaginaRegistro() {
  useTitulo('Crear cuenta');

  const { usuario, registrarse } = useSesion();
  const { mostrarAviso } = useAvisos();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const destino: string = ubicacion.state?.desde ?? '/';

  if (usuario) {
    return <Navigate to={destino} replace />;
  }

  async function alEnviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);

    const nuevosErrores: ErroresRegistro = {
      nombre: validarNombre(nombre),
      correo: validarCorreo(correo),
      contrasenia: validarContrasenia(contrasenia),
      telefono: validarTelefono(telefono),
    };
    setErrores(nuevosErrores);

    if (Object.values(nuevosErrores).some((error) => error)) return;

    setEnviando(true);
    try {
      await registrarse({
        nombre: nombre.trim(),
        correo: correo.trim(),
        contrasenia,
        telefono: telefono.trim(),
      });
      mostrarAviso('Tu cuenta se creó. ¡Bienvenido!', 'exito');
      navegar(destino, { replace: true });
    } catch (error) {
      if (error instanceof ErrorApi && error.codigo === 'CorreoYaRegistradoError') {
        // este error es del campo correo, así que sale junto a él
        setErrores({ correo: error.message });
      } else {
        setErrorGeneral(error instanceof ErrorApi ? error.message : 'No se pudo crear la cuenta.');
      }
      setEnviando(false);
    }
  }

  return (
    <section className="contenedor pagina">
      <div className="formulario">
        <h1 className="pagina__titulo">Crear cuenta</h1>

        <form onSubmit={alEnviar} noValidate>
          <Campo
            etiqueta="Nombre completo"
            name="nombre"
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errores.nombre}
          />
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
            etiqueta="Contraseña (mínimo 8 caracteres)"
            name="contrasenia"
            type="password"
            autoComplete="new-password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            error={errores.contrasenia}
          />
          <Campo
            etiqueta="Teléfono (10 dígitos)"
            name="telefono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            error={errores.telefono}
          />

          {errorGeneral && (
            <p className="formulario__error" role="alert">
              {errorGeneral}
            </p>
          )}

          <button type="submit" className="boton boton--bloque" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="formulario__pie">
          ¿Ya tienes cuenta?{' '}
          <Link to="/entrar" state={ubicacion.state}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
