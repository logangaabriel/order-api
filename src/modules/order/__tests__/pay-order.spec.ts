import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { PayOrderUseCase } from "../use-cases/pay-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('pay order', () => {
    let payOrderUseCase: PayOrderUseCase;

    const mockProduct = {
        id: 'product-uuid-1',
        name: 'Product 1',
        price: 100,
        stock: 10,
        active: true,
    };

    const mockOrderItem = {
        id: 'item-uuid-1',
        quantity: 2,
        unitPrice: 100,
        totalPrice: 200,
        product: { ...mockProduct },
    };

    const mockManager = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockOrder = {
        id: 'order-uuid-1',
        customerName: 'John Doe',
        customerId: 'user-uuid-1',
        customerEmail: 'john@example.com',
        totalAmount: 200,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [mockOrderItem],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn((callback) => callback(mockManager)),
                    },
                },
            ],
        }).compile();

        payOrderUseCase = module.get<PayOrderUseCase>(PayOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should pay a pending order successfully and reduce stock', async () => {
        const orderId = 'order-uuid-1';
        const pendingOrder = { 
            ...mockOrder, 
            status: OrderStatus.PENDING,
            items: [{ ...mockOrderItem, product: { ...mockProduct, stock: 10 } }]
        };
        const paidOrder = { ...pendingOrder, status: OrderStatus.PAID };

        mockManager.findOne.mockResolvedValue(pendingOrder);
        mockManager.save.mockResolvedValue(paidOrder);

        const result = await payOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.PAID);
        expect(mockManager.findOne).toHaveBeenCalledWith(expect.anything(), {
            where: { id: orderId },
            relations: ['items', 'items.product']
        });
        expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order is not found', async () => {
        const orderId = 'order-uuid-not-found';

        mockManager.findOne.mockResolvedValue(null);

        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não encontrado`);
    });

    it('should throw BadRequestException when order is already paid', async () => {
        const orderId = 'order-uuid-1';
        const paidOrder = { ...mockOrder, status: OrderStatus.PAID };

        mockManager.findOne.mockResolvedValue(paidOrder);

        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido não pode ser pago. Status atual: ${OrderStatus.PAID}`);
    });

    it('should throw BadRequestException when order is preparing', async () => {
        const orderId = 'order-uuid-1';
        const preparingOrder = { ...mockOrder, status: OrderStatus.PREPARING };

        mockManager.findOne.mockResolvedValue(preparingOrder);

        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido não pode ser pago. Status atual: ${OrderStatus.PREPARING}`);
    });

    it('should throw BadRequestException when order is delivered', async () => {
        const orderId = 'order-uuid-1';
        const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };

        mockManager.findOne.mockResolvedValue(deliveredOrder);

        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido não pode ser pago. Status atual: ${OrderStatus.DELIVERED}`);
    });

    it('should throw BadRequestException when order is cancelled', async () => {
        const orderId = 'order-uuid-1';
        const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(cancelledOrder);

        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(payOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido não pode ser pago. Status atual: ${OrderStatus.CANCELLED}`);
    });

    it('should reduce product stock for all items when paying', async () => {
        const orderId = 'order-uuid-1';
        const product1 = { ...mockProduct, id: 'product-uuid-1', stock: 10 };
        const product2 = { ...mockProduct, id: 'product-uuid-2', stock: 20 };
        
        const orderWithMultipleItems = {
            ...mockOrder,
            status: OrderStatus.PENDING,
            items: [
                { ...mockOrderItem, quantity: 2, product: product1 },
                { ...mockOrderItem, quantity: 5, product: product2 },
            ],
        };

        const paidOrder = { ...orderWithMultipleItems, status: OrderStatus.PAID };

        mockManager.findOne.mockResolvedValue(orderWithMultipleItems);
        mockManager.save.mockResolvedValue(paidOrder);

        await payOrderUseCase.execute(orderId);

        // Verify that save was called for each product (to update stock) and for the order
        expect(mockManager.save).toHaveBeenCalledTimes(3); // 2 products + 1 order
    });
});
