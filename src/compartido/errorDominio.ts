export abstract class ErrorDominio extends Error{
  constructor(mensaje: string){
    super(mensaje);
    this.name= this.constructor.name;
  }
}