import {
    ApiProperty,
    PartialType,
} from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';


export class CrearCategoriaDto {

    @ApiProperty({ example: 'Gorras' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre!: string;

    @ApiProperty({ example: 'Gorras y sombreros' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    descripcion!: string;
}


export class ActualizarCategoriaDto
    extends PartialType(CrearCategoriaDto) { }
