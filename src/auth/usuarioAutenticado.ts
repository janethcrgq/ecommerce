import { RolUsuario } from '../usuarios/dominio/enums/rolUsuarioEnum';

// lo que sabemos del usuario que mandó la credencial (el token).
// el id y el rol salen de la credencial firmada, nunca del cuerpo de la petición.
export interface UsuarioAutenticado {
    id: number;
    rol: RolUsuario;
}
