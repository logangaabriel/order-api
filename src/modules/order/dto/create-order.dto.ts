import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, IsOptional, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
    @IsNotEmpty({ message: 'O campo customerName é obrigatório' })
    @IsString({ message: 'O campo customerName deve ser uma string' })
    customerName: string;

    @IsNotEmpty({ message: 'O campo items é obrigatório' })
    @IsArray({ message: 'O campo items deve ser um array' })
    @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos 1 item' })
    @ValidateNested({ each: true, message: 'Cada item deve ser um objeto válido' })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsOptional()
    @IsString({ message: 'O campo notes deve ser uma string' })
    notes?: string;
}