import { ApiProperty } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';


export class CrearDireccionDto {

    @ApiProperty({ example: '85000' })
    @Matches(/^[0-9]{5}$/, {
        message: 'El código postal debe tener 5 dígitos',
    })
    codigoPostal!: string;

    @ApiProperty({ example: '123' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    numeroCasa!: string;

    @ApiProperty({ example: 'Calle Principal' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    calle!: string;

    @ApiProperty({ example: 'Centro' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    colonia!: string;

    @ApiProperty({ example: 'Ciudad Obregón' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    ciudad!: string;

    @ApiProperty({ example: 'Sonora' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    estado!: string;
}
