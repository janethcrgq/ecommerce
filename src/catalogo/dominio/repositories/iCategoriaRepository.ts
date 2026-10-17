import { Categoria } from "../entidades/categoria";

export interface ICategoriaRepository{
  guardar(categoria: Categoria): Promise<Categoria>;
  obtenerPorId(id: string): Promise<Categoria | null>;
  listar(): Promise<Categoria[]>;
  eliminar(id: string): Promise<void>;

}