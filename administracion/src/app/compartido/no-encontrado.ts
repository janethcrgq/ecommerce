import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <main class="no-encontrado">
      <p>404</p>
      <h1>Página no encontrada</h1>
      <span>La dirección que intentaste abrir no existe.</span>
      <a routerLink="/dashboard">Volver al panel</a>
    </main>
  `,
  styles: [`
    .no-encontrado { min-height: 100vh; display: grid; place-items: center; align-content: center; gap: .5rem; text-align: center; background: #f6f7fb; color: #172033; }
    p { color: #6842c2; font-size: 1.4rem; font-weight: 900; margin: 0; } h1 { margin: 0; } span { color: #667085; }
    a { margin-top: .8rem; background: #6842c2; color: white; padding: .65rem .9rem; border-radius: 8px; text-decoration: none; }
  `],
})
export class NoEncontrado {}
