
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DataSource } from 'typeorm';
import { OrderEntity } from "../entity/order.entity";
import { OrderItemEntity } from "../entity/order-item.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { ProductEntity } from "../../product/entity/product.entity";

@Injectable()
export class CreateOrderUseCase {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async execute(createOrderDto: CreateOrderDto): Promise<any> {
        return this.dataSource.transaction(async (manager) => {
            const orderItems: OrderItemEntity[] = [];
            let totalAmount = 0;

            for(const item of createOrderDto.items) {
                const product = await manager.findOne(ProductEntity, { 
                    where: { id: item.productId, active: true } 
                });
                
                if (!product) {
                    throw new NotFoundException(`Produto com ID ${item.productId} não encontrado ou inativo`);
                }

                if(product.stock < item.quantity) {
                    throw new BadRequestException(`Estoque insuficiente para o produto ${product.name}`);
                }
                
                const unitPrice = product.price;
                const totalPrice = unitPrice * item.quantity;
                totalAmount += totalPrice;

                const orderItem = manager.create(OrderItemEntity, {
                    product: product,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice
                });
                
                orderItems.push(orderItem);
            }

            const order = manager.create(OrderEntity, {
                customerName: createOrderDto.customerName,
                customerId: "00000000-0000-0000-0000-000000000000", 
                customerEmail: "temp@email.com", 
                totalAmount: totalAmount,
                items: orderItems
            });

            const savedOrder = await manager.save(order);
            
            const orderResponse = {
                id: savedOrder.id,
                customerName: savedOrder.customerName,
                totalAmount: savedOrder.totalAmount,
                status: savedOrder.status,
                createdAt: savedOrder.createdAt,
                items: savedOrder.items.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                }))
            };
            
            return orderResponse;
        });
    }
}