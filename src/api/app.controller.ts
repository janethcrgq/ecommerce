import {
    Controller,
    Get,
} from '@nestjs/common';

import {
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';


@ApiTags('servicio')
@Controller()
export class AppController {

    @Get()
    @ApiOperation({
        summary: 'Comprobar que el servicio está funcionando',
    })
    estado() {
        return {
            servicio: 'Tienda en Línea',
            estado: 'OK',
        };
    }
}