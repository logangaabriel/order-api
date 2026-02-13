import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class OrderItemDto {
    @IsNotEmpty({ message: 'O ID do produto é obrigatório em cada item' })
    @IsString({ message: 'O ID do produto deve ser uma string válida' })
    productId: string;

    @IsNotEmpty({ message: 'A quantidade é obrigatória em cada item' })
    @IsNumber({}, { message: 'A quantidade deve ser um número válido' })
    @Min(1, { message: 'Cada item deve ter quantidade mínima de 1 unidade' })
    quantity: number;
}