import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string): Promise<void> {
    const user = await this.dataSource.manager.findOne(UserEntity, { where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.dataSource.manager.remove(user);
  }
}
