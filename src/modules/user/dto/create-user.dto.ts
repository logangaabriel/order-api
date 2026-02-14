import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty({ message: 'Nome é obrigatório' })
    @IsString({ message: 'Nome deve ser uma string' })
    @MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
    name: string;

    @IsNotEmpty({ message: 'Email é obrigatório' })
    @IsEmail({}, { message: 'Email deve ser válido' })
    email: string;

    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @IsString({ message: 'Senha deve ser uma string' })
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        },
        {
            message: 'Senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo',
        },
    )
    password: string;

}