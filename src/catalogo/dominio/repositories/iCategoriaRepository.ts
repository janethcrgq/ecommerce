import { Categoria } from '../entidades/categoria';

export interface ICategoriaRepository {
  guardar(
    categoria: Categoria,
  ): Promise<Categoria>;

  obtenerPorId(
    id: number,
  ): Promise<Categoria | null>;

  listar(): Promise<Categoria[]>;

  actualizar(
    categoria: Categoria,
  ): Promise<Categoria | null>;

  eliminar(
    id: number,
  ): Promise<void>;
}