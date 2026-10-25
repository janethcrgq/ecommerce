import { RolUsuario } from '../enums/rolUsuarioEnum';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  contraseniaHash: string;
  rol: RolUsuario;
  telefono: string;
}

// el usuario sin su hash, es lo unico que se puede mostrar hacia afuera.
export type UsuarioPublico = Omit<Usuario, 'contraseniaHash'>;
