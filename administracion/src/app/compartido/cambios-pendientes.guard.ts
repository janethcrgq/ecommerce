import { CanDeactivateFn } from '@angular/router';

export interface ConCambiosPendientes {
  tieneCambiosPendientes(): boolean;
}

export const cambiosPendientesGuard: CanDeactivateFn<ConCambiosPendientes> = (
  componente,
) => {
  if (!componente.tieneCambiosPendientes()) {
    return true;
  }

  return window.confirm(
    'Tienes cambios sin guardar. ¿Seguro que quieres salir de esta pantalla?',
  );
};
