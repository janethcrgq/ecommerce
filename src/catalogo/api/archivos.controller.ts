import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';

import {
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join } from 'path';

import { Proteger } from '../../auth/proteger.decorator';
import { RolUsuario } from '../../usuarios/dominio/enums/rolUsuarioEnum';

interface ArchivoProducto {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
}

@ApiTags('archivos')
@Controller('archivos')
@Proteger(RolUsuario.ADMINISTRADOR)
export class ArchivosController {

    @Post('productos')
    @ApiOperation({
        summary: 'Subir una imagen para un producto (administrador)',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                archivo: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['archivo'],
        },
    })
    @UseInterceptors(
        FileInterceptor('archivo', {
            limits: {
                fileSize: 5 * 1024 * 1024,
                files: 1,
            },
        }),
    )
    async subirImagenProducto(
        @UploadedFile() archivo: ArchivoProducto | undefined,
    ): Promise<{ imagen: string }> {

        if (!archivo) {
            throw new BadRequestException(
                'Selecciona una imagen para el producto',
            );
        }

        const extensiones: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
        };

        const extension = extensiones[archivo.mimetype];

        if (!extension) {
            throw new BadRequestException(
                'La imagen debe estar en formato JPG, PNG o WEBP',
            );
        }

        const directorio = join(
            process.cwd(),
            'uploads',
            'productos',
        );

        await mkdir(directorio, {
            recursive: true,
        });

        const nombre =
            `${Date.now()}-${randomUUID()}${extension}`;

        await writeFile(
            join(directorio, nombre),
            archivo.buffer,
        );

        return {
            imagen: `/uploads/productos/${nombre}`,
        };
    }
}
