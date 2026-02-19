import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserEntity } from "../entity/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { DataSource } from "typeorm";
import { UserRole } from "../enum/user-role.enum";
import { HashingService } from "src/modules/auth/hashing/hashing.service";

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly hashingService: HashingService,
    ) {}

    async execute(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.dataSource.manager.findOne(UserEntity, {
                where: { email: createUserDto.email }
            });

            if (existingUser) {
                throw new BadRequestException('Email já está em uso');
            }

            const passwordHashed = await this.hashingService.hash(createUserDto.password);

            const user = await this.dataSource.manager.save(UserEntity, {
                ...createUserDto,
                password: passwordHashed,
                role: UserRole.USER,
            });

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Erro ao criar usuário');
        }
    }
}