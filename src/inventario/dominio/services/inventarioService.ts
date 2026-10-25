import { AjusteInventario } from '../entidades/ajusteInventario';

import { Motivo } from '../enums/motivoEnum';

import {
  CantidadAjusteInvalidaError,
  StockNegativoError,
} from '../errores/inventarioErrores';

import { IAjusteInventarioRepository } from '../repositories/iAjusteInventarioRepository';

import { VarianteProducto } from '../../../catalogo/dominio/entidades/varianteProducto';

import {
  VarianteNoEncontradaError,
} from '../../../catalogo/dominio/errores/catalogoErrores';

import {
  IVarianteProductoRepository,
} from '../../../catalogo/dominio/repositories/iVarianteProductoRepository';

import {
  validarAdministrador,
} from '../../../usuarios/dominio/reglas/validarAdministrador';

import {
  IUsuarioRepository,
} from '../../../usuarios/dominio/repositories/iUsuarioRepository';


export class InventarioService {

  constructor(
    private readonly varianteRepo:
      IVarianteProductoRepository,

    private readonly ajusteRepo:
      IAjusteInventarioRepository,

    private readonly usuarioRepo:
      IUsuarioRepository,
  ) {}


  async ajustarInventario(
    usuarioId: number,
    varianteId: number,
    cantidad: number,
    motivo: Motivo,
  ): Promise<AjusteInventario> {

    // Solamente un administrador puede modificar inventario.
    await validarAdministrador(
      this.usuarioRepo,
      usuarioId,
      'ajustar el inventario',
    );


    if (cantidad === 0) {
      throw new CantidadAjusteInvalidaError();
    }


    const variante =
      await this.varianteRepo.obtenerPorId(
        varianteId,
      );

    if (!variante) {
      throw new VarianteNoEncontradaError(
        varianteId,
      );
    }


    const nuevoStock =
      variante.stock + cantidad;


    // El inventario nunca puede quedar debajo de cero.
    if (nuevoStock < 0) {
      throw new StockNegativoError();
    }


    await this.varianteRepo.actualizarStock(
      varianteId,
      nuevoStock,
    );


    // Guardamos quién hizo el movimiento,
    // cuándo, cuánto y por qué.
    return this.ajusteRepo.guardar({
      id: 0,
      varianteId,
      usuarioId,
      fecha: new Date(),
      cantidad,
      motivo,
    });
  }


  // lista las variantes con su stock.
  // con soloStockBajo solo salen las que estan en o debajo de su minimo.
  async listarVariantes(
    usuarioId: number,
    soloStockBajo: boolean,
  ): Promise<VarianteProducto[]> {

    await validarAdministrador(
      this.usuarioRepo,
      usuarioId,
      'consultar el inventario',
    );

    const variantes =
      await this.varianteRepo.listar();

    if (!soloStockBajo) {
      return variantes;
    }

    return variantes.filter(
      (variante) =>
        variante.stock <=
        variante.stockMinimo,
    );
  }


  async consultarHistorial(
    usuarioId: number,
    varianteId?: number,
  ): Promise<AjusteInventario[]> {

    await validarAdministrador(
      this.usuarioRepo,
      usuarioId,
      'consultar el historial de ajustes',
    );


    if (varianteId === undefined) {
      return this.ajusteRepo.listar();
    }


    const variante =
      await this.varianteRepo.obtenerPorId(
        varianteId,
      );

    if (!variante) {
      throw new VarianteNoEncontradaError(
        varianteId,
      );
    }


    return this.ajusteRepo.listarPorVariante(
      varianteId,
    );
  }
}
