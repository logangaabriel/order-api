import { Injectable, ConflictException } from "@nestjs/common";
import { ProductEntity } from "../entity/product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { CreateProductDto } from "../dto/create-product.dto";

@Injectable()
export class CreateProductUseCase {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    async execute(createProductDto: CreateProductDto): Promise<ProductEntity> {
        const existingProduct = await this.productRepository.findOne({ 
            where: { name: createProductDto.name } 
        });
       
        if (existingProduct) {
            throw new ConflictException('Produto com este nome já existe');
        }

        const product = this.productRepository.create({
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            stock: createProductDto.stock,
        });

        return await this.productRepository.save(product);
    }
}