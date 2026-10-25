import {
    ApiProperty,
    ApiPropertyOptional,
    PartialType,
} from '@nestjs/swagger';

import { Type } from 'class-transformer';

import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { Color } from '../../dominio/enums/colorEnum';

import { Talla } from '../../dominio/enums/tallaEnum';


// aquí solo se revisa el tipo del dato (que sea número, texto, etc).
// reglas como "el precio debe ser mayor que cero" las revisa el dominio
// y se responden como conflicto (409).
export class CrearProductoDto {

    @ApiProperty({ example: 1 })
    @IsInt()
    categoriaId!: number;

    @ApiProperty({ example: 'Camiseta básica blanca' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    nombre!: string;

    @ApiProperty({ example: 'Camiseta casual de color blanco' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    descripcion!: string;

    @ApiProperty({ example: 350 })
    @IsNumber({ maxDecimalPlaces: 2 })
    precio!: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;

    @ApiProperty({ example: 'camiseta-blanca.jpg' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    imagen!: string;
}


// para editar todos los campos son opcionales.
// también sirve para activar o desactivar con el campo "activo".
export class ActualizarProductoDto
    extends PartialType(CrearProductoDto) { }


export class CrearVarianteDto {

    @ApiProperty({
        enum: Talla,
        example: Talla.M,
    })
    @IsEnum(Talla)
    talla!: Talla;

    @ApiProperty({
        enum: Color,
        example: Color.BLANCO,
    })
    @IsEnum(Color)
    color!: Color;

    @ApiProperty({
        example: 10,
        description: 'Stock inicial',
    })
    @IsInt()
    stock!: number;

    @ApiPropertyOptional({
        example: 2,
        description: 'Stock mínimo para la alerta de stock bajo',
    })
    @IsOptional()
    @IsInt()
    stockMinimo?: number;
}


// filtros opcionales del catálogo, llegan en la URL como texto
// y class-transformer los convierte a número.
export class FiltrosProductoDto {

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoriaId?: number;

    @ApiPropertyOptional({ example: 'camiseta' })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiPropertyOptional({ example: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    precioMin?: number;

    @ApiPropertyOptional({ example: 700 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    precioMax?: number;
}
