import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmacion',
  template: `
    @if (abierto()) {
      <div class="fondo-modal" (click)="cancelar.emit()">
        <section
          class="modal"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-label]="titulo()"
          (click)="$event.stopPropagation()"
        >
          <h2>{{ titulo() }}</h2>
          <p>{{ mensaje() }}</p>
          <div class="acciones">
            <button class="boton boton-secundario" type="button" (click)="cancelar.emit()">
              Cancelar
            </button>
            <button
              class="boton"
              [class.boton-peligro]="peligro()"
              [class.boton-primario]="!peligro()"
              type="button"
              [disabled]="procesando()"
              (click)="confirmar.emit()"
            >
              {{ procesando() ? 'Procesando...' : textoConfirmar() }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .fondo-modal { position: fixed; inset: 0; z-index: 50; background: rgba(17,24,39,.48); display: grid; place-items: center; padding: 1rem; }
    .modal { width: min(440px, 100%); background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 22px 60px rgba(0,0,0,.2); }
    h2 { margin: 0 0 .5rem; font-size: 1.12rem; } p { margin: 0; color: #667085; line-height: 1.5; }
    .acciones { display: flex; justify-content: flex-end; gap: .6rem; margin-top: 1.2rem; }
    .boton-peligro { background: #b42318; color: #fff; }
    .boton-peligro:hover:not(:disabled) { background: #912018; }
  `],
})
export class Confirmacion {
  readonly abierto = input(false);
  readonly titulo = input('Confirmar operación');
  readonly mensaje = input('¿Deseas continuar?');
  readonly textoConfirmar = input('Confirmar');
  readonly peligro = input(false);
  readonly procesando = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
