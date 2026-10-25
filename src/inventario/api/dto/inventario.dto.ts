import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { Type } from 'class-transformer';

import {
    IsEnum,
    IsIn,
    IsInt,
    IsOptional,
} from 'class-validator';

import { Motivo } from '../../dominio/enums/motivoEnum';


// aquí solo se revisa el tipo. que la cantidad no sea cero
// o que el stock no quede negativo lo revisa el dominio (409).
export class CrearAjusteDto {

    @ApiProperty({ example: 1 })
    @IsInt()
    varianteId!: number;

    @ApiProperty({
        example: 5,
        description: 'Positivo suma stock, negativo lo resta',
    })
    @IsInt()
    cantidad!: number;

    @ApiProperty({
        enum: Motivo,
        example: Motivo.ENTRADA,
    })
    @IsEnum(Motivo)
    motivo!: Motivo;
}


export class FiltrosVarianteDto {

    @ApiPropertyOptional({
        example: 'true',
        description: 'Con true solo salen las variantes con stock bajo',
    })
    @IsOptional()
    @IsIn(['true', 'false'])
    stockBajo?: string;
}


export class FiltrosAjusteDto {

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    varianteId?: number;
}
