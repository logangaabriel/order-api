
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { OrderStatus } from '../enum/order-status.enum';
import { OrderItemEntity } from './order-item.entity';
import { UserEntity } from '../../user/entity/user.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid', nullable: false })
    customerId: string;

    @Column({ length: 255, nullable: false })
    customerName: string;

    @Column({ length: 255, nullable: false })
    customerEmail: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    totalAmount: number;

    @Column({ 
        type: 'enum', 
        enum: OrderStatus, 
        default: OrderStatus.PENDING 
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItemEntity, item => item.order, { cascade: true })
    items: OrderItemEntity[];

    @ManyToMany(() => UserEntity, user => user.orders)
    @JoinTable({
        name: 'order_users',
        joinColumn: {
            name: 'orderId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'userId',
            referencedColumnName: 'id',
        },
    })
    users: UserEntity[];
}