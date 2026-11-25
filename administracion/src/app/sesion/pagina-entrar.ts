import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SesionService } from './sesion.service';
import { ErrorApi } from '../api/tipos';

@Component({
  selector: 'app-pagina-entrar',
  imports: [ReactiveFormsModule],
  templateUrl: './pagina-entrar.html',
  styleUrl: './pagina-entrar.css',
})
export class PaginaEntrar {
  private readonly fb = inject(FormBuilder);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly aviso = this.sesion.aviso;
  readonly enviando = signal(false);
  readonly error = signal('');

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasenia: ['', [Validators.required]],
  });

  constructor() {
    if (this.sesion.esAdministrador()) {
      void this.router.navigateByUrl('/dashboard');
    }
  }

  async entrar(): Promise<void> {
    this.error.set('');
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    this.enviando.set(true);

    try {
      const { correo, contrasenia } = this.formulario.getRawValue();
      await this.sesion.iniciar(correo, contrasenia);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          this.error.set('No se pudo conectar con el servicio.');
          return;
        }

        const respuesta = error.error as ErrorApi | undefined;
        const mensaje = respuesta?.mensaje;
        this.error.set(
          Array.isArray(mensaje)
            ? mensaje.join(' ')
            : mensaje ?? 'No se pudo iniciar sesión.',
        );
      } else if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('No se pudo iniciar sesión.');
      }
    } finally {
      this.enviando.set(false);
    }
  }
}
