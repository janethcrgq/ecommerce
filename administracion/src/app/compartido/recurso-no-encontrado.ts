import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recurso-no-encontrado',
  imports: [RouterLink],
  template: `
    <section class="no-encontrado" role="status">
      <span>404</span>
      <h2>{{ titulo() }}</h2>
      <p>{{ mensaje() }}</p>
      <a class="boton boton-primario" [routerLink]="volverA()">{{ textoVolver() }}</a>
    </section>
  `,
  styles: [`
    .no-encontrado { background:#fff; border:1px solid var(--borde); border-radius:12px; padding:3rem 1.5rem; text-align:center; }
    span { color:var(--morado); font-weight:900; font-size:1.35rem; } h2 { margin:.35rem 0; } p { color:var(--texto-suave); margin:0 0 1rem; }
    a { display:inline-flex; text-decoration:none; }
  `],
})
export class RecursoNoEncontrado {
  readonly titulo = input('Registro no encontrado');
  readonly mensaje = input('El identificador solicitado no existe.');
  readonly volverA = input('/dashboard');
  readonly textoVolver = input('Volver');
}
