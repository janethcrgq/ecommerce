// contrato para guardar contraseñas transformadas.
// el dominio no sabe si se usa bcrypt u otra cosa.
export interface IEncriptador {
  encriptar(
    texto: string,
  ): Promise<string>;

  comparar(
    texto: string,
    hash: string,
  ): Promise<boolean>;
}
