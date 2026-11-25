import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CatalogoAdminService, ProductoAdmin, VarianteProducto } from '../catalogo/catalogo-admin.service';
import { InventarioAdminService, AjusteInventario, MotivoAjuste } from './inventario-admin.service';
import { mensajeErrorApi } from '../api/error-api';
import { Cargando } from '../compartido/cargando';
import { MensajeError } from '../compartido/mensaje-error';
import { Confirmacion } from '../compartido/confirmacion';

@Component({
  selector: 'app-pagina-inventario',
  imports: [ReactiveFormsModule, Cargando, MensajeError, Confirmacion],
  templateUrl: './pagina-inventario.html',
  styleUrl: './pagina-inventario.css',
})
export class PaginaInventario {
  private readonly inventario = inject(InventarioAdminService);
  private readonly catalogo = inject(CatalogoAdminService);
  private readonly fb = inject(FormBuilder);

  readonly variantes = signal<VarianteProducto[]>([]);
  readonly todasVariantes = signal<VarianteProducto[]>([]);
  readonly productos = signal<ProductoAdmin[]>([]);
  readonly ajustes = signal<AjusteInventario[]>([]);
  readonly soloStockBajo = signal(false);
  readonly busqueda = signal('');
  readonly cargando = signal(true);
  readonly cargandoAjustes = signal(true);
  readonly errorCarga = signal('');
  readonly errorOperacion = signal('');
  readonly mensaje = signal('');
  readonly enviado = signal(false);
  readonly confirmando = signal(false);
  readonly procesando = signal(false);

  readonly productosPorId = computed(() => {
    const mapa = new Map<number, ProductoAdmin>();
    for (const producto of this.productos()) mapa.set(producto.id, producto);
    return mapa;
  });

  // la tabla se filtra por el nombre del producto, la talla o el color
  readonly variantesVisibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.variantes();

    return this.variantes().filter((variante) =>
      `${this.nombreProducto(variante.productoId)} ${variante.talla} ${variante.color}`
        .toLowerCase()
        .includes(texto),
    );
  });

  readonly formulario = this.fb.group({
    varianteId: this.fb.control<number | null>(null, [Validators.required]),
    cantidad: this.fb.control<number | null>(null, [Validators.required]),
    motivo: this.fb.control<MotivoAjuste>('ENTRADA', { nonNullable: true }),
  });

  constructor() {
    void this.cargarTodo();
  }

  async cargarTodo(): Promise<void> {
    this.cargando.set(true);
    this.cargandoAjustes.set(true);
    this.errorCarga.set('');

    try {
      const [todasVariantes, productos, ajustes] = await Promise.all([
        firstValueFrom(this.inventario.listarVariantes(false)),
        firstValueFrom(this.catalogo.listarProductos()),
        firstValueFrom(this.inventario.listarAjustes()),
      ]);

      this.todasVariantes.set(todasVariantes);
      this.variantes.set(
        this.soloStockBajo()
          ? todasVariantes.filter((variante) => variante.stock <= variante.stockMinimo)
          : todasVariantes,
      );
      this.productos.set(productos);
      this.ajustes.set(ajustes.slice().sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)));
    } catch (error) {
      this.errorCarga.set(mensajeErrorApi(error, 'No fue posible cargar el inventario.'));
    } finally {
      this.cargando.set(false);
      this.cargandoAjustes.set(false);
    }
  }

  async cambiarFiltro(evento: Event): Promise<void> {
    this.soloStockBajo.set((evento.target as HTMLInputElement).checked);
    this.cargando.set(true);
    this.errorCarga.set('');
    try {
      this.variantes.set(await firstValueFrom(this.inventario.listarVariantes(this.soloStockBajo())));
    } catch (error) {
      this.errorCarga.set(mensajeErrorApi(error, 'No fue posible actualizar el inventario.'));
    } finally {
      this.cargando.set(false);
    }
  }

  prepararAjuste(): void {
    this.enviado.set(true);
    this.errorOperacion.set('');
    this.mensaje.set('');
    this.formulario.markAllAsTouched();

    const cantidad = this.formulario.controls.cantidad.value;
    if (cantidad === 0) {
      this.formulario.controls.cantidad.setErrors({ cero: true });
    }

    if (this.formulario.invalid) return;
    this.confirmando.set(true);
  }

  cancelarConfirmacion(): void {
    this.confirmando.set(false);
  }

  async confirmarAjuste(): Promise<void> {
    const valor = this.formulario.getRawValue();
    if (valor.varianteId === null || valor.cantidad === null) return;

    this.procesando.set(true);
    this.errorOperacion.set('');

    try {
      await firstValueFrom(this.inventario.crearAjuste({
        varianteId: valor.varianteId,
        cantidad: valor.cantidad,
        motivo: valor.motivo,
      }));

      this.confirmando.set(false);
      this.mensaje.set('Ajuste de inventario registrado correctamente.');
      this.formulario.reset({ varianteId: null, cantidad: null, motivo: 'ENTRADA' });
      this.enviado.set(false);
      await this.cargarTodo();
    } catch (error) {
      this.confirmando.set(false);
      this.errorOperacion.set(mensajeErrorApi(error));
    } finally {
      this.procesando.set(false);
    }
  }

  nombreProducto(productoId: number): string {
    return this.productosPorId().get(productoId)?.nombre ?? `Producto #${productoId}`;
  }

  descripcionVariante(variante: VarianteProducto): string {
    return `${this.nombreProducto(variante.productoId)} · ${variante.talla} / ${variante.color}`;
  }

  variantePorId(id: number): VarianteProducto | undefined {
    return this.todasVariantes().find((variante) => variante.id === id);
  }

  nombreVariante(id: number): string {
    const variante = this.variantePorId(id);
    return variante ? this.descripcionVariante(variante) : `Variante #${id}`;
  }

  formatoFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  mostrarError(campo: 'varianteId' | 'cantidad'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  textoConfirmacion(): string {
    const valor = this.formulario.getRawValue();
    const variante = valor.varianteId ? this.variantePorId(valor.varianteId) : undefined;
    const nombre = variante ? this.descripcionVariante(variante) : 'la variante seleccionada';
    return `Se registrará un ajuste de ${valor.cantidad ?? 0} unidad(es) en ${nombre}. El movimiento quedará en el historial.`;
  }
}
