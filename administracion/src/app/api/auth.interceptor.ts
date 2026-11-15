import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../sesion/sesion.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const sesion = inject(SesionService);
  const router = inject(Router);
  const token = sesion.token();

  const peticion = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        sesion.cerrar();
        void router.navigateByUrl('/entrar');
      }

      return throwError(() => error);
    }),
  );
};
