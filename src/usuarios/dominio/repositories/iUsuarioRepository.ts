import { Usuario } from '../entidades/usuario';

export interface IUsuarioRepository {
  guardar(
    usuario: Usuario,
  ): Promise<Usuario>;

  obtenerPorId(
    id: number,
  ): Promise<Usuario | null>;

  obtenerPorCorreo(
    correo: string,
  ): Promise<Usuario | null>;

  actualizar(
    usuario: Usuario,
  ): Promise<Usuario | null>;
}