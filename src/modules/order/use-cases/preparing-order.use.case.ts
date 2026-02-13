import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { OrderEntity } from "../entity/order.entity";
import { OrderStatus } from '../enum/order-status.enum';


@Injectable()
export class PreparingOrderUseCase {
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
                throw new NotFoundException(`Pedido com ID ${orderId} não encontrado`);
            }

            if (order.status !== OrderStatus.PAID) {
                throw new NotFoundException(`Pedido com ID ${orderId} não está pago e não pode ser preparado`);
            }

            order.status = OrderStatus.PREPARING;
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