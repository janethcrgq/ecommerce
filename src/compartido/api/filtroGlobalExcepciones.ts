import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

import { ErrorDominio } from '../errorDominio';

import {
    ProductoNoEncontradoError,
    VarianteNoEncontradaError,
} from '../../catalogo/dominio/errores/catalogoErrores';

import {
    ItemNoEncontradoError,
} from '../../carrito/dominio/errores/carritoErrores';

import {
    EnvioNoEncontradoError,
    OrdenNoEncontradaError,
    PagoNoEncontradoError,
} from '../../ordenes/dominio/errores/ordenesErrores';

import {
    DireccionNoEncontradaError,
    PermisoDenegadoError,
    UsuarioNoEncontradoError,
} from '../../usuarios/dominio/errores/usuarioErrores';


@Catch()
export class FiltroGlobalExcepciones
    implements ExceptionFilter {

    catch(
        exception: unknown,
        host: ArgumentsHost,
    ): void {

        const contexto =
            host.switchToHttp();

        const response =
            contexto.getResponse();

        const request =
            contexto.getRequest();


        let status =
            HttpStatus.INTERNAL_SERVER_ERROR;

        let mensaje:
            string | string[] =
            'Ocurrió un error interno';


        /*
         * Los errores lanzados por NestJS,
         * por ejemplo ValidationPipe o ParseIntPipe.
         */
        if (
            exception instanceof
            HttpException
        ) {

            status =
                exception.getStatus();

            const respuesta =
                exception.getResponse();


            if (
                typeof respuesta ===
                'string'
            ) {
                mensaje =
                    respuesta;
            }

            else if (
                typeof respuesta ===
                'object' &&
                respuesta !== null &&
                'message' in respuesta
            ) {

                const contenido =
                    respuesta as {
                        message:
                        string | string[];
                    };

                mensaje =
                    contenido.message;
            }
        }


        /*
         * Recurso que no existe.
         */
        else if (
            exception instanceof
            ProductoNoEncontradoError ||
            exception instanceof
            VarianteNoEncontradaError ||
            exception instanceof
            UsuarioNoEncontradoError ||
            exception instanceof
            DireccionNoEncontradaError ||
            exception instanceof
            OrdenNoEncontradaError ||
            exception instanceof
            PagoNoEncontradoError ||
            exception instanceof
            EnvioNoEncontradoError ||
            exception instanceof
            ItemNoEncontradoError
        ) {

            status =
                HttpStatus.NOT_FOUND;

            mensaje =
                exception.message;
        }


        /*
         * Usuario autenticado pero sin permiso.
         */
        else if (
            exception instanceof
            PermisoDenegadoError
        ) {

            status =
                HttpStatus.FORBIDDEN;

            mensaje =
                exception.message;
        }


        /*
         * Cualquier otra regla del dominio
         * que impida realizar una operación.
         */
        else if (
            exception instanceof
            ErrorDominio
        ) {

            status =
                HttpStatus.CONFLICT;

            mensaje =
                exception.message;
        }


        response.status(
            status,
        ).json({
            ok: false,
            statusCode:
                status,
            mensaje,
            ruta:
                request.url,
            fecha:
                new Date().toISOString(),
        });
    }
}