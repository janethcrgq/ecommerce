import { ApiProperty } from '@nestjs/swagger';

import { IsInt } from 'class-validator';


// aquí solo se revisa que sea un número entero.
// que la cantidad sea de al menos una unidad lo revisa el dominio (409).
export class AgregarItemDto {

    @ApiProperty({
        example: 1,
        description: 'Id de la variante (talla y color) que se agrega',
    })
    @IsInt()
    varianteId!: number;

    @ApiProperty({ example: 2 })
    @IsInt()
    cantidad!: number;
}


export class ModificarCantidadDto {

    @ApiProperty({
        example: 3,
        description: 'La cantidad nueva final, no se suma a la anterior',
    })
    @IsInt()
    cantidad!: number;
}
