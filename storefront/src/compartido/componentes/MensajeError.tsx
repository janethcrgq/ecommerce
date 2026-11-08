// situación 3: algo falló. dice qué pasó (con el mensaje para la persona)
// y deja volver a intentar.
import type { ErrorApi } from '../../api/errores';

interface MensajeErrorProps {
  error: ErrorApi;
  alReintentar?: () => void;
}

export function MensajeError({ error, alReintentar }: MensajeErrorProps) {
  const titulo = error.tipo === 'sin_conexion'
    ? 'No hay conexión con la tienda'
    : 'Algo salió mal';

  return (
    <div className="estado estado--error" role="alert">
      <h2 className="estado__titulo">{titulo}</h2>
      <p className="estado__texto">{error.message}</p>
      {alReintentar && (
        <button className="boton" onClick={alReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}
