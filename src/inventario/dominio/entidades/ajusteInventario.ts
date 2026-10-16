import { Motivo } from "../enums/motivoEnum";

export interface AjusteInventario{
  id: string,
  fecha: Date,
  cantidad: number,
  motivo: Motivo,
  varianteId: string,
  usuarioId: string




}