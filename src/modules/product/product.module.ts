import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductEntity } from './entity/product.entity';
import { CreateProductUseCase } from './use-cases/create-product.use.case';
import { FindProductsUseCase } from './use-cases/find-products.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    FindProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: [
    TypeOrmModule,
    CreateProductUseCase,
    FindProductsUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
})
export class ProductModule {}