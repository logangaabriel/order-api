import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { CreateUserUseCase } from './use-case/create-user.use.case';
import { UpdateUserUseCase } from './use-case/update-user.use.case';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [CreateUserUseCase, UpdateUserUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, TypeOrmModule],
})
export class UserModule {}
