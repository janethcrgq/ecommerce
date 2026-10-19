import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import {
    PrismaMariaDb,
} from '@prisma/adapter-mariadb';

import {
    PrismaClient,
} from '../../generated/prisma/client';


@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    constructor() {

        process.loadEnvFile();

        const adapter =
            new PrismaMariaDb({
                host:
                    process.env['DATABASE_HOST']
                    ?? 'localhost',

                port:
                    Number(
                        process.env['DATABASE_PORT']
                        ?? 3306,
                    ),

                user:
                    process.env['DATABASE_USER']
                    ?? 'root',

                password:
                    process.env['DATABASE_PASSWORD']
                    ?? '',

                database:
                    process.env['DATABASE_NAME']
                    ?? 'tienda_en_linea',

                connectionLimit:
                    5,
            });


        super({
            adapter,
        });
    }


    async onModuleInit():
        Promise<void> {

        await this.$connect();
    }


    async onModuleDestroy():
        Promise<void> {

        await this.$disconnect();
    }
}