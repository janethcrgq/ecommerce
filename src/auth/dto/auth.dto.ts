import { ApiProperty } from '@nestjs/swagger';

import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';


export class RegistroDto {

    @ApiProperty({ example: 'Ana Pérez' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre!: string;

    @ApiProperty({ example: 'ana@correo.com' })
    @IsEmail()
    @MaxLength(100)
    correo!: string;

    @ApiProperty({ example: 'Ana12345!' })
    @IsString()
    @MinLength(8, {
        message: 'La contraseña debe tener al menos 8 caracteres',
    })
    @MaxLength(72)
    contrasenia!: string;

    @ApiProperty({ example: '6441234567' })
    @Matches(/^[0-9]{10}$/, {
        message: 'El teléfono debe tener 10 dígitos',
    })
    telefono!: string;
}


export class SesionDto {

    @ApiProperty({ example: 'cliente@tienda.mx' })
    @IsEmail()
    correo!: string;

    @ApiProperty({ example: 'Cliente123!' })
    @IsString()
    @IsNotEmpty()
    contrasenia!: string;
}
