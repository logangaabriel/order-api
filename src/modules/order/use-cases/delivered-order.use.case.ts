import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../enum/order-status.enum';


@Injectable()
export class DeliveredOrderUseCase {
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

            if (order.status !== OrderStatus.PREPARING) {
                throw new BadRequestException(`Pedido com ID ${orderId} não está em preparação e não pode ser entregue`);
            }

            order.status = OrderStatus.DELIVERED;
            const savedOrder = await manager.save(order);

            return {
                id: savedOrder.id,
                customerName: savedOrder.customerName,
                totalAmount: Number(savedOrder.totalAmount),
                status: savedOrder.status,
                updatedAt: savedOrder.updatedAt,
                items: savedOrder.items.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice)
                }))
            };
        });
    }
}