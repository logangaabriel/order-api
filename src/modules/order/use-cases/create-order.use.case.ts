
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DataSource, In } from 'typeorm';
import { OrderEntity } from "../entity/order.entity";
import { OrderItemEntity } from "../entity/order-item.entity";
import { CreateOrderDto } from "../dto/create-order.dto";
import { ProductEntity } from "../../product/entity/product.entity";
import { UserEntity } from "../../user/entity/user.entity";

@Injectable()
export class CreateOrderUseCase {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async execute(createOrderDto: CreateOrderDto) {
        return this.dataSource.transaction(async (manager) => {
            const orderItems: OrderItemEntity[] = [];
            let totalAmount = 0;

            const users = await manager.find(UserEntity, {
                where: { id: In(createOrderDto.userIds) }
            });

            if (users.length !== createOrderDto.userIds.length) {
                const foundIds = new Set(users.map(user => user.id));
                const missingIds = createOrderDto.userIds.filter(id => !foundIds.has(id));
                throw new NotFoundException(`Usuários não encontrados: ${missingIds.join(', ')}`);
            }

            const primaryUser = users[0];

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
                customerId: primaryUser.id,
                customerEmail: primaryUser.email,
                totalAmount: totalAmount,
                items: orderItems,
                users: users,
            });

            const savedOrder = await manager.save(order);
            
            return {
                id: savedOrder.id,
                customerName: savedOrder.customerName,
                totalAmount: Number(savedOrder.totalAmount),
                status: savedOrder.status,
                createdAt: savedOrder.createdAt,
                users: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                })),
                items: orderItems.map(item => ({
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice)
                }))
            };
        });
    }
}