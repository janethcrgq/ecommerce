import { RolUsuario } from '../enums/rolUsuarioEnum';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  contraseniaHash: string;
  rol: RolUsuario;
  telefono: string;
}