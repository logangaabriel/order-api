import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entity/order.entity';
import { OrderItemEntity } from './entity/order-item.entity';
import { UserEntity } from '../user/entity/user.entity';
import { CreateOrderUseCase } from './use-cases/create-order.use.case';
import { FindOrderUseCase } from './use-cases/find-order.use.case';
import { PayOrderUseCase } from './use-cases/pay-order.use.case';
import { PreparingOrderUseCase } from './use-cases/preparing-order.use.case';
import { DeliveredOrderUseCase } from './use-cases/delivered-order.use.case';
import { CancelOrderUseCase } from './use-cases/cancel-order.use.case';
import { ProductModule } from '../product/product.module';
import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, UserEntity]),
    ProductModule
  ],
  controllers: [OrderController],
  providers: [
    CreateOrderUseCase,
    FindOrderUseCase,
    PayOrderUseCase,
    PreparingOrderUseCase,
    DeliveredOrderUseCase,
    CancelOrderUseCase,
  ],
  exports: [
    CreateOrderUseCase,
    FindOrderUseCase,
    PayOrderUseCase,
    PreparingOrderUseCase,
    DeliveredOrderUseCase,
    CancelOrderUseCase,
  ],
})
export class OrderModule {}