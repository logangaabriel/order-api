import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateProductUseCase } from './use-cases/create-product.use.case';
import { FindProductsUseCase } from './use-cases/find-products.use-case';
import { UpdateProductUseCase } from './use-cases/update-product.use-case';
import { DeactivateProductUseCase } from './use-cases/deactivate-product.use-case';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entity/product.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@Controller('products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly findProductsUseCase: FindProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deactivateProductUseCase: DeactivateProductUseCase,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.createProductUseCase.execute(createProductDto);
  }

  @Public()
  @Get()
  async findAll(@Query() pagination: PaginationDto, @Query('status') status?: 'active' | 'inactive') {
    return this.findProductsUseCase.findAll(pagination, status);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductEntity> {
    return this.findProductsUseCase.findById(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    return this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.deactivateProductUseCase.execute(id);
  }
}