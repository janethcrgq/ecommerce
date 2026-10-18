import { ErrorDominio } from "../../../compartido/errorDominio";

export class PrecioInvalidoError extends ErrorDominio{
  constructor(precio: number){
    super(`El precio debe ser mayor que cero. Precio recibido: ${precio}`);
  }
}

export class StockInsuficienteError extends ErrorDominio{
  constructor(solicitada: number, disponible: number){
    super(`No es posible solicitar ${solicitada} unidades. Stock disponible: ${disponible}`);
  }
}

export class ProductoNoEncontradoError extends ErrorDominio{
  constructor(productoId: string){
    super(`No existe el producto ${productoId}`);
  }
}

export class VarianteNoEncontradaError extends ErrorDominio{
  constructor(varianteId: string){
    super(`No existe la variante de producto ${varianteId}`);
  }
}


