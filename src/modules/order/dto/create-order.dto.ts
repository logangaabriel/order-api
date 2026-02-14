import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional, ArrayMinSize, IsUUID, ArrayUnique } from 'class-validator';
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

    @IsNotEmpty({ message: 'O campo userIds é obrigatório' })
    @IsArray({ message: 'O campo userIds deve ser um array' })
    @ArrayMinSize(1, { message: 'O pedido deve estar vinculado a pelo menos 1 usuário' })
    @ArrayUnique({ message: 'O campo userIds não pode ter IDs repetidos' })
    @IsUUID('4', { each: true, message: 'Cada userId deve ser um UUID válido' })
    userIds: string[];

    @IsOptional()
    @IsString({ message: 'O campo notes deve ser uma string' })
    notes?: string;
}