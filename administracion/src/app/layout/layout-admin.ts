import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SesionService } from '../sesion/sesion.service';

@Component({
  selector: 'app-layout-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-admin.html',
  styleUrl: './layout-admin.css',
})
export class LayoutAdmin {
  readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  async salir(): Promise<void> {
    this.sesion.cerrar();
    await this.router.navigateByUrl('/entrar');
  }
}
