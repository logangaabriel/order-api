import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { UserRole } from '../enum/user-role.enum';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(pagination: PaginationDto, role?: UserRole): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await this.dataSource.manager.findAndCount(UserEntity, {
      where: role ? { role } : {},
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async execute(id: string) {
    const user = await this.dataSource.manager.findOne(UserEntity, { where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
