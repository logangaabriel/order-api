import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.use.case';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entity/order.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return this.createOrderUseCase.execute(createOrderDto);
  }
}