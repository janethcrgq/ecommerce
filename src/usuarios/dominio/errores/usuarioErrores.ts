import { ErrorDominio } from '../../../compartido/errorDominio';

export class UsuarioNoEncontradoError extends ErrorDominio {
  constructor() {
    super(
      'El usuario no existe',
    );
  }
}

export class CorreoYaRegistradoError extends ErrorDominio {
  constructor() {
    super(
      'Ya existe una cuenta con ese correo',
    );
  }
}

export class CredencialesInvalidasError extends ErrorDominio {
  constructor() {
    super(
      'El correo o la contraseña no son correctos',
    );
  }
}

export class DireccionNoEncontradaError extends ErrorDominio {
  constructor() {
    super(
      'La dirección indicada no existe',
    );
  }
}

export class DireccionNoPerteneceAlUsuarioError extends ErrorDominio {
  constructor() {
    super(
      'La dirección seleccionada no pertenece al usuario',
    );
  }
}

export class PermisoDenegadoError extends ErrorDominio {
  constructor(accion: string) {
    super(
      `Solo un administrador puede ${accion}`,
    );
  }
}
