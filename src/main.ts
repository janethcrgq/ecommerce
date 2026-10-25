import './configuracion';

import {
    LoggingInterceptor,
} from './compartido/api/logging.interceptor';
import 'reflect-metadata';

import {
    ValidationPipe,
} from '@nestjs/common';

import {
    NestFactory,
} from '@nestjs/core';

import {
    DocumentBuilder,
    SwaggerModule,
} from '@nestjs/swagger';

import {
    AppModule,
} from './app.module';
import {
    FiltroGlobalExcepciones,
} from './compartido/api/filtroGlobalExcepciones';

import {
    SobreRespuestaInterceptor,
} from './compartido/api/sobreRespuesta.interceptor';

async function bootstrap() {

    const app =
        await NestFactory.create(
            AppModule,
        );


    // Valida todo lo que entre a la API.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(
        new FiltroGlobalExcepciones(),
    );

    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        new SobreRespuestaInterceptor(),
    );

    // Origen que posteriormente utilizará el frontend.
    // se lee del .env para no dejarlo escrito dentro del código.
    // solo ese origen puede usar la API desde un navegador.
    app.enableCors({
        origin:
            process.env['FRONTEND_ORIGIN']
            ?? 'http://localhost:5173',
    });


    const config =
        new DocumentBuilder()
            .setTitle(
                'Tienda en Línea API',
            )
            .setDescription(
                'Servicio central del proyecto Tienda en Línea',
            )
            .setVersion('1.0')
            .addBearerAuth()
            .build();


    const documento =
        SwaggerModule.createDocument(
            app,
            config,
        );


    SwaggerModule.setup(
        'docs',
        app,
        documento,
    );


    const puerto =
        Number(process.env['PORT'] ?? 3000);

    await app.listen(
        puerto,
    );


    console.log(
        `API: http://localhost:${puerto}`,
    );

    console.log(
        `Swagger: http://localhost:${puerto}/docs`,
    );
}


bootstrap();