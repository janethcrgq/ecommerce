import { Direccion } from '../entidades/direccion';

import { UsuarioNoEncontradoError } from '../errores/usuarioErrores';

import { IDireccionRepository } from '../repositories/iDireccionRepository';

import { IUsuarioRepository } from '../repositories/iUsuarioRepository';


export type DatosDireccion = Omit<
  Direccion,
  'id' | 'usuarioId'
>;


export class DireccionService {

  constructor(
    private readonly direccionRepo: IDireccionRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) { }


  // un usuario puede tener muchas direcciones.
  async registrar(
    usuarioId: number,
    datos: DatosDireccion,
  ): Promise<Direccion> {

    const usuario =
      await this.usuarioRepo.obtenerPorId(
        usuarioId,
      );

    if (!usuario) {
      throw new UsuarioNoEncontradoError();
    }

    return this.direccionRepo.guardar({
      id: 0,
      usuarioId,
      ...datos,
    });
  }


  // solo se listan las direcciones del propio usuario.
  async listar(
    usuarioId: number,
  ): Promise<Direccion[]> {

    return this.direccionRepo.listarPorUsuario(
      usuarioId,
    );
  }
}
