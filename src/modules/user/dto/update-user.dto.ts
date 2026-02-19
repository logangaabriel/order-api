import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { UserRole } from "../enum/user-role.enum";

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'Nome deve ser uma string' })
    @MaxLength(100, { message: 'Nome não pode ter mais de 100 caracteres' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email deve ser válido' })
    email?: string;

    @IsOptional()
    @IsEnum(UserRole, { message: 'Role deve ser ADMIN ou USER' })
    role?: UserRole;
}