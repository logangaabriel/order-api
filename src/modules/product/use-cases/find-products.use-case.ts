import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductEntity } from "../entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';

@Injectable()
export class FindProductsUseCase {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async findAll(pagination: PaginationDto, status?: 'active' | 'inactive'): Promise<PaginatedResponse<ProductEntity>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) {
            where.active = status === 'active';
        }

        const [data, total] = await this.productRepository.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    async findById(id: string): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({ 
            where: { id } 
        });
        
        if (!product) {
            throw new NotFoundException('Produto não encontrado');
        }

        return product;
    }
}