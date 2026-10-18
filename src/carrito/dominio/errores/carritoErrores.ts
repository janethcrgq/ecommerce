import { ErrorDominio } from '../../../compartido/errorDominio';

export class ProductoInactivoError extends ErrorDominio {
  constructor() {
    super(
      'El producto solicitado no se encuentra disponible para compra',
    );
  }
}

export class CantidadInvalidaError extends ErrorDominio {
  constructor(cantidad: number) {
    super(
      `La cantidad debe ser de al menos una unidad. Cantidad recibida: ${cantidad}`,
    );
  }
}

export class ItemNoEncontradoError extends ErrorDominio {
  constructor(varianteId: number) {
    super(
      `La variante ${varianteId} no está en el carrito`,
    );
  }
}

export class CarritoVacioError extends ErrorDominio {
  constructor() {
    super(
      'No se puede confirmar una compra con el carrito vacío',
    );
  }
}