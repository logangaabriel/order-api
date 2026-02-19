import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserUseCase } from './use-case/create-user.use.case';
import { UpdateUserUseCase } from './use-case/update-user.use.case';
import { FindUserUseCase } from './use-case/find-user.use.case';
import { DeleteUserUseCase } from './use-case/delete-user.use.case';
import { ResetPasswordUseCase } from './use-case/reset-password.use.case';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserRole } from './enum/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto, @Query('role') role?: UserRole) {
    return this.findUserUseCase.findAll(pagination, role);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return this.findUserUseCase.execute(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Param('id') id: string, @Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.resetPasswordUseCase.execute(id, resetPasswordDto);
  }
}
