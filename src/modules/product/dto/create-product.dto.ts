import { IsNotEmpty, IsNumber, IsString, IsOptional, IsPositive, Min, MaxLength } from "class-validator";

export class CreateProductDto {

    @IsString({ message: 'Nome deve ser uma string' })
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    @MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Descrição deve ser uma string' })
    @MaxLength(500, { message: 'Descrição não pode ter mais de 500 caracteres' })
    description?: string;

    @IsNotEmpty({ message: 'Preço é obrigatório' })
    @IsNumber({}, { message: 'Preço deve ser um número' })
    @IsPositive({ message: 'Preço deve ser um valor positivo' })
    price: number;

    @IsNotEmpty({ message: 'Estoque é obrigatório' })
    @IsNumber({}, { message: 'Estoque deve ser um número' })
    @Min(1, { message: 'Estoque não pode ser negativo' })
    stock: number;
}