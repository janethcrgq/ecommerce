import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import { Type } from 'class-transformer';

import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

import { EstadoOrden } from '../../dominio/enums/estadoOrdenEnum';

import { EstadoPago } from '../../dominio/enums/estadoPagoEnum';

import { MetodoPago } from '../../dominio/enums/metodoPagoEnum';


export class ConfirmarCompraDto {

    @ApiProperty({
        example: 1,
        description: 'Id de una dirección registrada por el cliente',
    })
    @IsInt()
    direccionId!: number;

    @ApiProperty({
        enum: MetodoPago,
        example: MetodoPago.TARJETA,
    })
    @IsEnum(MetodoPago)
    metodoPago!: MetodoPago;
}


export class CambiarEstadoOrdenDto {

    @ApiProperty({
        enum: EstadoOrden,
        example: EstadoOrden.PROCESANDO,
    })
    @IsEnum(EstadoOrden)
    estado!: EstadoOrden;
}


export class CambiarEstadoPagoDto {

    @ApiProperty({
        enum: EstadoPago,
        example: EstadoPago.PAGADO,
    })
    @IsEnum(EstadoPago)
    estado!: EstadoPago;
}


export class RegistrarEnvioDto {

    @ApiProperty({ example: 'Estafeta' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombrePaqueteria!: string;

    @ApiProperty({ example: 'GUIA-123456' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    numeroGuia!: string;
}


// filtros opcionales del listado de órdenes (llegan en la URL).
export class FiltrosOrdenDto {

    @ApiPropertyOptional({ enum: EstadoOrden })
    @IsOptional()
    @IsEnum(EstadoOrden)
    estado?: EstadoOrden;

    @ApiPropertyOptional({
        example: '2026-10-01',
        description: 'Desde esta fecha (AAAA-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    fechaDesde?: string;

    @ApiPropertyOptional({
        example: '2026-10-31',
        description: 'Hasta esta fecha, incluida (AAAA-MM-DD)',
    })
    @IsOptional()
    @IsDateString()
    fechaHasta?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Solo lo usa el administrador para filtrar por cliente',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    usuarioId?: number;
}
