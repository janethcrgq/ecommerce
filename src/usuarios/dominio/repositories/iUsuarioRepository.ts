import { Usuario } from "../entidades/usuario";

export interface IUsuarioRepository{
  guardar(usuario: Usuario): Promise<Usuario>; 
  obtenerPorId(id: string): Promise<Usuario | null>;
  obtenerPorCorreo(correo: string): Promise<Usuario | null>;  
}