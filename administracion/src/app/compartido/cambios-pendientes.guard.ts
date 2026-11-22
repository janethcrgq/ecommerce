import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { SesionService } from '../sesion/sesion.service';

export interface ConCambiosPendientes {
  tieneCambiosPendientes(): boolean;
}

export const cambiosPendientesGuard: CanDeactivateFn<ConCambiosPendientes> = (
  componente,
) => {
  // Si la sesión terminó, no bloquear la salida hacia el login.
  // El guardia del servidor sigue siendo quien protege los datos.
  if (!inject(SesionService).token() || !componente.tieneCambiosPendientes()) {
    return true;
  }

  return window.confirm(
    'Tienes cambios sin guardar. ¿Seguro que quieres salir de esta pantalla?',
  );
};
