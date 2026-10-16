import { RolUsuario } from "../enums/rolUsuarioEnum";

export interface Usuario{
  id: string,
  nombre: string,
  correo: string,
  contraseniaHash: string,
  rol: RolUsuario,
  telefono: string
}