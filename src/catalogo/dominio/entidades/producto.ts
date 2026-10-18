export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  activo: boolean;
  imagen: string;
}