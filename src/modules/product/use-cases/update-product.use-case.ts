import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { ProductEntity } from "../entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { UpdateProductDto } from "../dto/update-product.dto";

@Injectable()
export class UpdateProductUseCase {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async execute(id: string, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({ 
            where: { id, active: true } 
        });
        
        if (!product) {
            throw new NotFoundException('Produto não encontrado');
        }

        if (updateProductDto.name && updateProductDto.name !== product.name) {
            const existingProduct = await this.productRepository.findOne({
                where: { 
                    name: updateProductDto.name,
                    active: true
                }
            });
            
            if (existingProduct && existingProduct.id !== id) {
                throw new ConflictException('Produto com este nome já existe');
            }
        }

        Object.assign(product, updateProductDto);
        
        return await this.productRepository.save(product);
    }
}