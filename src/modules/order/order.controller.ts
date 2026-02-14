import { Controller, Post, Body, Param, Patch, Get, Query } from '@nestjs/common';
import { CreateOrderUseCase } from './use-cases/create-order.use.case';
import { FindOrderUseCase } from './use-cases/find-order.use.case';
import { PayOrderUseCase } from './use-cases/pay-order.use.case';
import { PreparingOrderUseCase } from './use-cases/preparing-order.use.case';
import { DeliveredOrderUseCase } from './use-cases/delivered-order.use.case';
import { CancelOrderUseCase } from './use-cases/cancel-order.use.case';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './enum/order-status.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderUseCase: FindOrderUseCase,
    private readonly payOrderUseCase: PayOrderUseCase,
    private readonly preparingOrderUseCase: PreparingOrderUseCase,
    private readonly deliveredOrderUseCase: DeliveredOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase
  ) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto, @Query('status') status?: OrderStatus) {
    return this.findOrderUseCase.findAll(pagination, status);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Patch(':id/pay')
  async pay(@Param('id') id: string) {
    return this.payOrderUseCase.execute(id);
  }

  @Patch(':id/prepare')
  async prepare(@Param('id') id: string) {
    return this.preparingOrderUseCase.execute(id);
  }

  @Patch(':id/deliver')
  async deliver(@Param('id') id: string) {
    return this.deliveredOrderUseCase.execute(id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.cancelOrderUseCase.execute(id);
  }
}