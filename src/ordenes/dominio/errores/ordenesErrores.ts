import { ErrorDominio } from '../../../compartido/errorDominio';
import { EstadoOrden } from '../enums/estadoOrdenEnum';


export class OrdenNoEncontradaError extends ErrorDominio {
  constructor() {
    super(
      'La orden no existe',
    );
  }
}


export class TransicionEstadoInvalidaError extends ErrorDominio {
  constructor(
    actual: EstadoOrden,
    nuevo: EstadoOrden,
  ) {
    super(
      `No se puede cambiar una orden de ${actual} a ${nuevo}`,
    );
  }
}


export class PagoNoEncontradoError extends ErrorDominio {
  constructor() {
    super(
      'La orden no tiene un pago registrado',
    );
  }
}


export class PagoPendienteError extends ErrorDominio {
  constructor() {
    super(
      'La orden no puede procesarse mientras el pago no esté confirmado',
    );
  }
}


export class EnvioNoEncontradoError extends ErrorDominio {
  constructor() {
    super(
      'La orden todavía no tiene un envío registrado',
    );
  }
}


export class EnvioYaRegistradoError extends ErrorDominio {
  constructor() {
    super(
      'La orden ya tiene un envío registrado',
    );
  }
}

export class OrdenAjenaError extends ErrorDominio {
  constructor() {
    super(
      'La orden pertenece a otro usuario',
    );
  }
}


export class PagoYaRealizadoError extends ErrorDominio {
  constructor() {
    super(
      'El pago de esta orden ya fue realizado',
    );
  }
}
