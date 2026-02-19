import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { CreateUserUseCase } from './use-case/create-user.use.case';
import { UpdateUserUseCase } from './use-case/update-user.use.case';
import { UserController } from './user.controller';
import { FindUserUseCase } from './use-case/find-user.use.case';
import { DeleteUserUseCase } from './use-case/delete-user.use.case';
import { ResetPasswordUseCase } from './use-case/reset-password.use.case';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UserController],
  providers: [CreateUserUseCase, UpdateUserUseCase, FindUserUseCase, DeleteUserUseCase, ResetPasswordUseCase],
  exports: [CreateUserUseCase, UpdateUserUseCase, FindUserUseCase, DeleteUserUseCase, ResetPasswordUseCase, TypeOrmModule],
})
export class UserModule {}
