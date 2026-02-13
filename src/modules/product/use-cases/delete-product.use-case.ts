import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductEntity } from "../entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';

@Injectable()
export class DeleteProductUseCase {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async execute(id: string): Promise<void> {
        const product = await this.productRepository.findOne({ 
            where: { id, active: true } 
        });
        
        if (!product) {
            throw new NotFoundException('Produto não encontrado');
        }

        product.active = false;
        await this.productRepository.save(product);
    }
}