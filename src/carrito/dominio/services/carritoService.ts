import { ProductoNoEncontradoError, StockInsuficienteError, VarianteNoEncontradaError } from "../../../catalogo/dominio/errores/catalogoErrores";
import { IProductosRepository } from "../../../catalogo/dominio/repositories/iProductoRepository";
import { IVarianteProductoRepository } from "../../../catalogo/dominio/repositories/iVarianteProductoRepository";
import { CantidadInvalidaError, ProductoInactivoError } from "../errores/carritoErrores";
import { ICarritoRepository } from "../repositories/iCarritoRepository";

export class CarritoService{
  constructor(
    private readonly carritoRepo: ICarritoRepository,
    private readonly productoRepo: IProductosRepository,
    private readonly varianteRepo: IVarianteProductoRepository
  ) {}

  async agregar(usuarioId: string, varianteId: string, cantidad: number): Promise<void>{
    // validar min 1 
    this.validarCantidad(cantidad);

    // buscar la variante y comprobar que el producto este activp
    const variante = await this.varianteRepo.obtenerPorId(varianteId);
    if(variante === null){
      throw new VarianteNoEncontradaError(varianteId);
    }

   const producto = await this.productoRepo.obtenerPorId(variante.productoId);
   if(producto === null){
    throw new ProductoNoEncontradoError(variante.productoId);
   }
   if(!producto.activo){
    throw new ProductoInactivoError();
   }

   // pedir el carrito del cliente
   const carrito= await this.carritoRepo.obtenerPorUsuario(usuarioId);


   const itemExistente= carrito?.listaItems.find(
    (item)=> item.varianteId === varianteId
   )

   const cantidadEnCarrito= itemExistente?.cantidad ?? 0;
   const cantidadTotal= cantidadEnCarrito + cantidad;


   if(cantidadTotal > variante.stock) {
    throw new StockInsuficienteError(cantidadTotal, variante.stock);
   }




  }

  private validarCantidad(cantidad: number): void {
    if(!Number.isInteger(cantidad) || cantidad < 1){
      throw new CantidadInvalidaError(cantidad);
    }
  }


}