import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../enum/order-status.enum';


@Injectable()
export class CancelOrderUseCase {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async execute(orderId: string) {
      return this.dataSource.transaction(async (manager) => {
          const order = await manager.findOne(OrderEntity, {
              where: { id: orderId },
              relations: ['items', 'items.product']
          });

          if (!order) {
              throw new BadRequestException(`Pedido com ID ${orderId} não encontrado`);
          }

          if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
              throw new BadRequestException(`Pedido com ID ${orderId} não pode ser cancelado`);
          }

          order.status = OrderStatus.CANCELLED;
          const savedOrder = await manager.save(order); 
          
          return savedOrder;
      });
    }
}