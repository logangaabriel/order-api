import { BadRequestException, Injectable } from "@nestjs/common";
import { UserEntity } from "../entity/user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { DataSource } from "typeorm";
import { UserRole } from "../enum/user-role.enum";

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async execute(createUserDto: CreateUserDto) {
        const existingUser = await this.dataSource.manager.findOne(UserEntity, {
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            throw new BadRequestException('Email já está em uso');
        }

        const user = this.dataSource.manager.create(UserEntity, {
            ...createUserDto,
            role: UserRole.USER,
        });
        return this.dataSource.manager.save(user);
    }
}