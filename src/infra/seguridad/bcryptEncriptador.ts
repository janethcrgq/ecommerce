import * as bcrypt from 'bcryptjs';

import { IEncriptador } from '../../usuarios/dominio/seguridad/iEncriptador';


// implementacion del contrato con bcrypt.
// el hash nunca se puede volver a convertir en la contraseña.
export class BcryptEncriptador
    implements IEncriptador {

    async encriptar(
        texto: string,
    ): Promise<string> {

        return bcrypt.hash(
            texto,
            10,
        );
    }


    async comparar(
        texto: string,
        hash: string,
    ): Promise<boolean> {

        return bcrypt.compare(
            texto,
            hash,
        );
    }
}
