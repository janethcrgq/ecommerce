import { RolUsuario } from "../enums/rolUsuarioEnum";
import { Direccion } from "./direccion";

export interface Usuario{
  id: string,
  nombre: string,
  correo: string,
  contraseniaHash: string,
  rol: RolUsuario,
  telefono: string,
  direcciones: Direccion[];
}