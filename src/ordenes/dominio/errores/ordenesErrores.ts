import { ErrorDominio } from "../../../compartido/errorDominio";
import { EstadoOrden } from "../enums/estadoOrdenEnum";

export class CarritoVacioError extends ErrorDominio {
  constructor() {
    super("No se puede confirmar una compra con el carrito vacío");
  }
}

export class TransicionEstadoInvalidaError extends ErrorDominio {
  constructor(actual: EstadoOrden, nuevo: EstadoOrden) {
    super(`No se puede cambiar una orden de ${actual} a ${nuevo}`);
  }
}