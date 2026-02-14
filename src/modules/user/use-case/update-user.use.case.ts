import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { UserEntity } from "../entity/user.entity";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UpdateUserUseCase {
    constructor(
        private readonly dataSource: DataSource 
    ) {}

    async execute(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.dataSource.manager.findOne(UserEntity, { where: { id } });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.dataSource.manager.findOne(UserEntity, {
                where: { email: updateUserDto.email }
            });

            if (existingUser) {
                throw new Error('Email já está em uso');
            }
        }

        const updatedUser = this.dataSource.manager.merge(UserEntity, user, updateUserDto);
        return this.dataSource.manager.save(updatedUser);
    }
}