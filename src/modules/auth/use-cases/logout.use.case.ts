import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';

@Injectable()
export class LogoutUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(userId: string): Promise<void> {
    await this.dataSource.manager.update(
      UserEntity,
      { id: userId },
      { refreshTokenHash: null },
    );
  }
}
