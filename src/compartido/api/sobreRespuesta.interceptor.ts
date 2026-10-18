import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';

import {
    Observable,
} from 'rxjs';

import {
    map,
} from 'rxjs/operators';


@Injectable()
export class SobreRespuestaInterceptor<T>
    implements NestInterceptor<
        T,
        {
            ok: true;
            datos: T;
        }
    > {

    intercept(
        _context:
            ExecutionContext,

        next:
            CallHandler<T>,
    ): Observable<{
        ok: true;
        datos: T;
    }> {

        return next.handle().pipe(
            map(
                (datos) => ({
                    ok: true,
                    datos,
                }),
            ),
        );
    }
}