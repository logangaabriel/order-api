import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../../product/entity/product.entity';

@Entity('order_items')
export class OrderItemEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    orderId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    unitPrice: number;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    totalPrice: number;

    @ManyToOne(() => OrderEntity, order => order.items)
    @JoinColumn({ name: 'orderId' })
    order: OrderEntity;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: 'productId' })
    product: ProductEntity;
}