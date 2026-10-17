import { AjusteInventario } from "../entidades/ajusteInventario";

export interface IAjusteInventarioRepository{
  guardar(ajuste: AjusteInventario): Promise<AjusteInventario>;
  listarPorVariante(varianteId: string): Promise<AjusteInventario[]>;

}