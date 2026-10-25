import { ErrorDominio } from '../../../compartido/errorDominio';

export class PrecioInvalidoError extends ErrorDominio {
  constructor(precio: number) {
    super(
      `El precio debe ser mayor que cero. Precio recibido: ${precio}`,
    );
  }
}

export class StockInsuficienteError extends ErrorDominio {
  constructor(
    solicitada: number,
    disponible: number,
  ) {
    super(
      `No es posible solicitar ${solicitada} unidades. Stock disponible: ${disponible}`,
    );
  }
}

export class ProductoNoEncontradoError extends ErrorDominio {
  constructor(productoId: number) {
    super(
      `No existe el producto ${productoId}`,
    );
  }
}

export class VarianteNoEncontradaError extends ErrorDominio {
  constructor(varianteId: number) {
    super(
      `No existe la variante de producto ${varianteId}`,
    );
  }
}

export class CategoriaNoEncontradaError extends ErrorDominio {
  constructor(categoriaId: number) {
    super(
      `No existe la categoría ${categoriaId}`,
    );
  }
}

export class CategoriaRepetidaError extends ErrorDominio {
  constructor(nombre: string) {
    super(
      `Ya existe una categoría llamada ${nombre}`,
    );
  }
}

export class CategoriaConProductosError extends ErrorDominio {
  constructor() {
    super(
      'No se puede eliminar una categoría que todavía tiene productos',
    );
  }
}

export class VarianteRepetidaError extends ErrorDominio {
  constructor() {
    super(
      'El producto ya tiene una variante con esa talla y color',
    );
  }
}
