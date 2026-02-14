import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { OrderEntity } from '../entity/order.entity';
import { OrderStatus } from '../enum/order-status.enum';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class FindOrderUseCase {
    constructor(
        private readonly dataSource: DataSource
    ) {}
    
    async findAll(pagination: PaginationDto, status?: OrderStatus): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [orders, total] = await this.dataSource.manager.findAndCount(OrderEntity, {
            where: status ? { status } : {},
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        const data = orders.map(order => ({
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            }))
        }));

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    async findById(id: string) {
        const order = await this.dataSource.manager.findOne(OrderEntity, {
            where: { id },
            relations: ['items', 'items.product']
        });

        if (!order) {
            throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
        }

        return {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            }))
        };
    }
}