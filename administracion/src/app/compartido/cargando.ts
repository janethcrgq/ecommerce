import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cargando',
  template: `
    <div class="cargando" role="status">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ texto() }}</span>
    </div>
  `,
  styles: [`
    .cargando { min-height: 220px; display: grid; place-items: center; align-content: center; gap: .8rem; color: #667085; }
    .spinner { width: 30px; height: 30px; border: 3px solid #e7e1f7; border-top-color: #6842c2; border-radius: 999px; animation: giro .75s linear infinite; }
    @keyframes giro { to { transform: rotate(360deg); } }
  `],
})
export class Cargando {
  readonly texto = input('Cargando...');
}
