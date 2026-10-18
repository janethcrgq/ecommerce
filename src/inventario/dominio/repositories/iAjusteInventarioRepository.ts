import { AjusteInventario } from '../entidades/ajusteInventario';

export interface IAjusteInventarioRepository {
  guardar(
    ajuste: AjusteInventario,
  ): Promise<AjusteInventario>;

  listar(): Promise<AjusteInventario[]>;

  listarPorVariante(
    varianteId: number,
  ): Promise<AjusteInventario[]>;
}