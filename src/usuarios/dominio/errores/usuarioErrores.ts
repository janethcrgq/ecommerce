import { ErrorDominio } from "../../../compartido/errorDominio";

export class PermisoDenegadoError extends ErrorDominio {
  constructor(accion: string) {
    super(`Solo un administrador puede ${accion}`);
  }
}