import { RolUsuario } from '../enums/rolUsuarioEnum';

import {
  PermisoDenegadoError,
  UsuarioNoEncontradoError,
} from '../errores/usuarioErrores';

import { IUsuarioRepository } from '../repositories/iUsuarioRepository';


// regla del admin: solo un administrador puede hacer ciertas cosas.
// la dejamos aqui para no repetirla en cada servicio.
export async function validarAdministrador(
  usuarioRepo: IUsuarioRepository,
  usuarioId: number,
  accion: string,
): Promise<void> {

  const usuario =
    await usuarioRepo.obtenerPorId(
      usuarioId,
    );

  if (!usuario) {
    throw new UsuarioNoEncontradoError();
  }

  if (usuario.rol !== RolUsuario.ADMINISTRADOR) {
    throw new PermisoDenegadoError(
      accion,
    );
  }
}
