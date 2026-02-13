import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateProductUseCase } from './use-cases/create-product.use.case';
import { FindProductsUseCase } from './use-cases/find-products.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entity/product.entity';

@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductsUseCase: FindProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.createProductUseCase.execute(createProductDto);
  }

  @Get()
  async findAll(@Query('status') status?: 'active' | 'inactive'): Promise<ProductEntity[]> {
    return this.findProductsUseCase.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductEntity> {
    return this.findProductsUseCase.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    return this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.deleteProductUseCase.execute(id);
  }
}