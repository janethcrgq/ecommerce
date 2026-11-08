// un campo de formulario con su etiqueta y su mensaje de error justo debajo.
// el error aparece junto al campo que lo provocó, no como un aviso general.
import type { InputHTMLAttributes } from 'react';

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string | null;
}

export function Campo({ etiqueta, error, id, name, ...resto }: CampoProps) {
  const idCampo = id ?? name;

  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={idCampo}>
        {etiqueta}
      </label>
      <input
        id={idCampo}
        name={name}
        className={error ? 'campo__entrada campo__entrada--error' : 'campo__entrada'}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idCampo}-error` : undefined}
        {...resto}
      />
      {error && (
        <p id={`${idCampo}-error`} className="campo__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
