import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { CancelOrderUseCase } from "../use-cases/cancel-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('cancel order', () => {
    let cancelOrderUseCase: CancelOrderUseCase;

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
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn((callback) => callback(mockManager)),
                    },
                },
            ],
        }).compile();

        cancelOrderUseCase = module.get<CancelOrderUseCase>(CancelOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should cancel a pending order successfully', async () => {
        const orderId = 'order-uuid-1';
        const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
        const cancelledOrder = { ...pendingOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(pendingOrder);
        mockManager.save.mockResolvedValue(cancelledOrder);

        const result = await cancelOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.CANCELLED);
        expect(mockManager.findOne).toHaveBeenCalledWith(expect.anything(), {
            where: { id: orderId }
        });
        expect(mockManager.save).toHaveBeenCalled();
    });

    it('should cancel a paid order successfully', async () => {
        const orderId = 'order-uuid-1';
        const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
        const cancelledOrder = { ...paidOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(paidOrder);
        mockManager.save.mockResolvedValue(cancelledOrder);

        const result = await cancelOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should cancel a preparing order successfully', async () => {
        const orderId = 'order-uuid-1';
        const preparingOrder = { ...mockOrder, status: OrderStatus.PREPARING };
        const cancelledOrder = { ...preparingOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(preparingOrder);
        mockManager.save.mockResolvedValue(cancelledOrder);

        const result = await cancelOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw BadRequestException when order is not found', async () => {
        const orderId = 'order-uuid-not-found';

        mockManager.findOne.mockResolvedValue(null);

        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não encontrado`);
    });

    it('should throw BadRequestException when order is already cancelled', async () => {
        const orderId = 'order-uuid-1';
        const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(cancelledOrder);

        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não pode ser cancelado`);
    });

    it('should throw BadRequestException when order is already delivered', async () => {
        const orderId = 'order-uuid-1';
        const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };

        mockManager.findOne.mockResolvedValue(deliveredOrder);

        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(cancelOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não pode ser cancelado`);
    });
});
