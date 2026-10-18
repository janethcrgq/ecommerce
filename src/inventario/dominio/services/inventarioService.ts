import { AjusteInventario } from '../entidades/ajusteInventario';

import { Motivo } from '../enums/motivoEnum';

import {
  CantidadAjusteInvalidaError,
  StockNegativoError,
} from '../errores/inventarioErrores';

import { IAjusteInventarioRepository } from '../repositories/iAjusteInventarioRepository';

import {
  VarianteNoEncontradaError,
} from '../../../catalogo/dominio/errores/catalogoErrores';

import {
  IVarianteProductoRepository,
} from '../../../catalogo/dominio/repositories/iVarianteProductoRepository';

import {
  PermisoDenegadoError,
  UsuarioNoEncontradoError,
} from '../../../usuarios/dominio/errores/usuarioErrores';

import {
  RolUsuario,
} from '../../../usuarios/dominio/enums/rolUsuarioEnum';

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
    await this.validarAdministrador(
      usuarioId,
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


  async consultarHistorial():
  Promise<AjusteInventario[]> {

    return this.ajusteRepo.listar();
  }


  async consultarHistorialVariante(
    varianteId: number,
  ): Promise<AjusteInventario[]> {

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


  private async validarAdministrador(
    usuarioId: number,
  ): Promise<void> {

    const usuario =
      await this.usuarioRepo.obtenerPorId(
        usuarioId,
      );

    if (!usuario) {
      throw new UsuarioNoEncontradoError();
    }


    if (
      usuario.rol !==
      RolUsuario.ADMINISTRADOR
    ) {
      throw new PermisoDenegadoError(
        'ajustar el inventario',
      );
    }
  }
}