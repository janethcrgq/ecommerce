export interface Envio {
  id: number;
  ordenId: number;
  nombrePaqueteria: string;
  numeroGuia: string;
  fechaEnvio: Date;
  fechaEntrega: Date | null;
}