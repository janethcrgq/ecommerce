import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

export const adminGuard: CanActivateFn = () => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  if (sesion.esAdministrador()) {
    return true;
  }

  sesion.cerrar();
  return router.createUrlTree(['/entrar']);
};
