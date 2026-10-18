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
    finalize,
} from 'rxjs/operators';


@Injectable()
export class LoggingInterceptor
    implements NestInterceptor {

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {

        const request =
            context.switchToHttp().getRequest();

        const inicio =
            Date.now();

        const metodo =
            request.method;

        const ruta =
            request.url;


        return next.handle().pipe(
            finalize(() => {

                const tiempo =
                    Date.now() - inicio;

                console.log(
                    `${metodo} ${ruta} - ${tiempo} ms`,
                );
            }),
        );
    }
}