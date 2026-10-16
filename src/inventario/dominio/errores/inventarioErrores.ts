import { ErrorDominio } from "../../../compartido/errorDominio";

export class StockNegativoError extends ErrorDominio{
  constructor(stockActual: number, cantidad: number){
    super(`El ajuste de ${cantidad} dejaría el stock en ${stockActual + cantidad}. El stock no puede ser menor que cero. Stock actual: ${stockActual}`)

  }
}