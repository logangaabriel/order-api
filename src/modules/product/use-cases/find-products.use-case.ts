import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductEntity } from "../entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class FindProductsUseCase {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async findAll(status?: 'active' | 'inactive'): Promise<ProductEntity[]> {
        const options: any = {
            order: { createdAt: 'DESC' }
        };

        if (status) {
            options.where = { active: status === 'active' };
        }

        return await this.productRepository.find(options);
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