import { Motivo } from '../enums/motivoEnum';

export interface AjusteInventario {
  id: number;
  varianteId: number;
  usuarioId: number;
  fecha: Date;
  cantidad: number;
  motivo: Motivo;
}