import { ErrorDominio } from '../../../compartido/errorDominio';

export class StockNegativoError extends ErrorDominio {
  constructor() {
    super(
      'El ajuste dejaría el inventario con una existencia menor que cero',
    );
  }
}

export class CantidadAjusteInvalidaError extends ErrorDominio {
  constructor() {
    super(
      'La cantidad del ajuste no puede ser cero',
    );
  }
}