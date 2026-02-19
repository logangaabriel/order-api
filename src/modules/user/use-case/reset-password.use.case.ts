import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { HashingService } from 'src/modules/auth/hashing/hashing.service';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingService,
  ) {}

  async execute(id: string, resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.dataSource.manager.findOne(UserEntity, { where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isSamePassword = await this.hashingService.compare(resetPasswordDto.newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException('A nova senha não pode ser igual à senha anterior');
    }

    user.password = await this.hashingService.hash(resetPasswordDto.newPassword);
    await this.dataSource.manager.save(user);

  }
}
