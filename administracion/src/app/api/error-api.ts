import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from './tipos';

export function mensajeErrorApi(
  error: unknown,
  mensajePorDefecto = 'No fue posible completar la operación.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return mensajePorDefecto;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servicio.';
  }

  const cuerpo = error.error as Partial<ErrorApi> | undefined;
  const mensaje = cuerpo?.mensaje;

  if (Array.isArray(mensaje)) {
    return mensaje.join(' ');
  }

  if (typeof mensaje === 'string' && mensaje.trim()) {
    return mensaje;
  }

  return mensajePorDefecto;
}
