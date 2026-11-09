// el formulario para guardar una dirección de envío nueva.
import { useState, type SubmitEvent } from 'react';
import { ErrorApi } from '../../api/errores';
import type { Direccion } from '../../api/tipos';
import { Campo } from '../../compartido/componentes/Campo';
import { crearDireccion, type DatosDireccion } from './direccionesServicio';

interface FormularioDireccionProps {
  alGuardar: (direccion: Direccion) => void;
  // si ya hay otras direcciones se puede cancelar; si no, el formulario es obligatorio
  alCancelar?: () => void;
}

type ErroresDireccion = Partial<Record<keyof DatosDireccion, string>>;

const VACIA: DatosDireccion = {
  codigoPostal: '',
  calle: '',
  numeroCasa: '',
  colonia: '',
  ciudad: '',
  estado: '',
};

function validar(datos: DatosDireccion): ErroresDireccion {
  const errores: ErroresDireccion = {};

  if (!/^[0-9]{5}$/.test(datos.codigoPostal.trim())) errores.codigoPostal = 'El código postal debe tener 5 dígitos.';
  if (datos.calle.trim() === '') errores.calle = 'Escribe la calle.';
  if (datos.numeroCasa.trim() === '') errores.numeroCasa = 'Escribe el número.';
  if (datos.colonia.trim() === '') errores.colonia = 'Escribe la colonia.';
  if (datos.ciudad.trim() === '') errores.ciudad = 'Escribe la ciudad.';
  if (datos.estado.trim() === '') errores.estado = 'Escribe el estado.';

  return errores;
}

export function FormularioDireccion({ alGuardar, alCancelar }: FormularioDireccionProps) {
  const [datos, setDatos] = useState<DatosDireccion>(VACIA);
  const [errores, setErrores] = useState<ErroresDireccion>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // devuelve las propiedades que necesita cada campo para quedar conectado a "datos"
  function propiedades(nombre: keyof DatosDireccion) {
    return {
      name: nombre,
      value: datos[nombre],
      error: errores[nombre],
      onChange: (e: { target: { value: string } }) => setDatos({ ...datos, [nombre]: e.target.value }),
    };
  }

  async function alEnviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);

    const nuevosErrores = validar(datos);
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) return;

    setGuardando(true);
    try {
      const guardada = await crearDireccion({
        codigoPostal: datos.codigoPostal.trim(),
        calle: datos.calle.trim(),
        numeroCasa: datos.numeroCasa.trim(),
        colonia: datos.colonia.trim(),
        ciudad: datos.ciudad.trim(),
        estado: datos.estado.trim(),
      });
      alGuardar(guardada);
    } catch (error) {
      setErrorGeneral(error instanceof ErrorApi ? error.message : 'No se pudo guardar la dirección.');
      setGuardando(false);
    }
  }

  return (
    <form className="formulario-direccion" onSubmit={alEnviar} noValidate>
      <Campo etiqueta="Calle" autoComplete="address-line1" {...propiedades('calle')} />
      <div className="filtros__fila">
        <Campo etiqueta="Número" {...propiedades('numeroCasa')} />
        <Campo etiqueta="Código postal" inputMode="numeric" autoComplete="postal-code" {...propiedades('codigoPostal')} />
      </div>
      <Campo etiqueta="Colonia" {...propiedades('colonia')} />
      <div className="filtros__fila">
        <Campo etiqueta="Ciudad" autoComplete="address-level2" {...propiedades('ciudad')} />
        <Campo etiqueta="Estado" autoComplete="address-level1" {...propiedades('estado')} />
      </div>

      {errorGeneral && (
        <p className="formulario__error" role="alert">
          {errorGeneral}
        </p>
      )}

      <div className="filtros__acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar dirección'}
        </button>
        {alCancelar && (
          <button type="button" className="boton boton--secundario" onClick={alCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
