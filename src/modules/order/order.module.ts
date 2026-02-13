import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { CreateOrderUseCase } from './use-cases/create-order.use.case';
import { ProductModule } from '../product/product.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    ProductModule
  ],
  controllers: [OrderController],
  providers: [
    CreateOrderUseCase,
  ],
  exports: [
    CreateOrderUseCase,
  ],
})
export class OrderModule {}