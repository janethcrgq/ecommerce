import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-mensaje-error',
  template: `
    <section class="error-datos" role="alert">
      <h2>No se pudo cargar la información</h2>
      <p>{{ mensaje() }}</p>
      <button type="button" (click)="reintentar.emit()">Reintentar</button>
    </section>
  `,
  styles: [`
    .error-datos { background: #fff; border: 1px solid #f4c7c3; border-left: 4px solid #d92d20; border-radius: 10px; padding: 1.2rem; }
    h2 { margin: 0 0 .35rem; font-size: 1rem; } p { margin: 0 0 .8rem; color: #667085; }
    button { border: 1px solid #d0d5dd; background: #fff; border-radius: 7px; padding: .55rem .8rem; cursor: pointer; font-weight: 650; }
  `],
})
export class MensajeError {
  readonly mensaje = input.required<string>();
  readonly reintentar = output<void>();
}
