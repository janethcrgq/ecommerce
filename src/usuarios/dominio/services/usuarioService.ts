import {
  Usuario,
  UsuarioPublico,
} from '../entidades/usuario';

import { RolUsuario } from '../enums/rolUsuarioEnum';

import {
  CorreoYaRegistradoError,
  CredencialesInvalidasError,
  UsuarioNoEncontradoError,
} from '../errores/usuarioErrores';

import { IUsuarioRepository } from '../repositories/iUsuarioRepository';

import { IEncriptador } from '../seguridad/iEncriptador';


export class UsuarioService {

  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly encriptador: IEncriptador,
  ) { }


  // quien se registra siempre queda como cliente.
  // el admin solo se crea desde el seed.
  async registrar(
    nombre: string,
    correo: string,
    contrasenia: string,
    telefono: string,
  ): Promise<UsuarioPublico> {

    const correoLimpio =
      correo.trim().toLowerCase();

    const existente =
      await this.usuarioRepo.obtenerPorCorreo(
        correoLimpio,
      );

    if (existente) {
      throw new CorreoYaRegistradoError();
    }


    // guardamos el hash, nunca la contraseña tal cual.
    const contraseniaHash =
      await this.encriptador.encriptar(
        contrasenia,
      );

    const nuevo =
      await this.usuarioRepo.guardar({
        id: 0,
        nombre,
        correo: correoLimpio,
        contraseniaHash,
        rol: RolUsuario.CLIENTE,
        telefono,
      });

    return this.sinHash(nuevo);
  }


  // si el correo no existe o la contraseña esta mal se responde lo mismo.
  async iniciarSesion(
    correo: string,
    contrasenia: string,
  ): Promise<UsuarioPublico> {

    const usuario =
      await this.usuarioRepo.obtenerPorCorreo(
        correo.trim().toLowerCase(),
      );

    if (!usuario) {
      throw new CredencialesInvalidasError();
    }

    const coincide =
      await this.encriptador.comparar(
        contrasenia,
        usuario.contraseniaHash,
      );

    if (!coincide) {
      throw new CredencialesInvalidasError();
    }

    return this.sinHash(usuario);
  }


  async obtenerPerfil(
    usuarioId: number,
  ): Promise<UsuarioPublico> {

    const usuario =
      await this.usuarioRepo.obtenerPorId(
        usuarioId,
      );

    if (!usuario) {
      throw new UsuarioNoEncontradoError();
    }

    return this.sinHash(usuario);
  }


  private sinHash(
    usuario: Usuario,
  ): UsuarioPublico {

    const {
      contraseniaHash,
      ...publico
    } = usuario;

    return publico;
  }
}
