import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { DeliveredOrderUseCase } from "../use-cases/delivered-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('delivered order', () => {
    let deliveredOrderUseCase: DeliveredOrderUseCase;

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
        status: OrderStatus.PREPARING,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeliveredOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn((callback) => callback(mockManager)),
                    },
                },
            ],
        }).compile();

        deliveredOrderUseCase = module.get<DeliveredOrderUseCase>(DeliveredOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should deliver a preparing order successfully', async () => {
        const orderId = 'order-uuid-1';
        const preparingOrder = { ...mockOrder, status: OrderStatus.PREPARING };
        const deliveredOrder = { ...preparingOrder, status: OrderStatus.DELIVERED };

        mockManager.findOne.mockResolvedValue(preparingOrder);
        mockManager.save.mockResolvedValue(deliveredOrder);

        const result = await deliveredOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.DELIVERED);
        expect(mockManager.findOne).toHaveBeenCalledWith(expect.anything(), {
            where: { id: orderId }
        });
        expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when order is not found', async () => {
        const orderId = 'order-uuid-not-found';

        mockManager.findOne.mockResolvedValue(null);

        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não encontrado`);
    });

    it('should throw BadRequestException when order is pending', async () => {
        const orderId = 'order-uuid-1';
        const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };

        mockManager.findOne.mockResolvedValue(pendingOrder);

        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está em preparação e não pode ser entregue`);
    });

    it('should throw BadRequestException when order is paid but not preparing', async () => {
        const orderId = 'order-uuid-1';
        const paidOrder = { ...mockOrder, status: OrderStatus.PAID };

        mockManager.findOne.mockResolvedValue(paidOrder);

        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está em preparação e não pode ser entregue`);
    });

    it('should throw BadRequestException when order is already delivered', async () => {
        const orderId = 'order-uuid-1';
        const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };

        mockManager.findOne.mockResolvedValue(deliveredOrder);

        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está em preparação e não pode ser entregue`);
    });

    it('should throw BadRequestException when order is cancelled', async () => {
        const orderId = 'order-uuid-1';
        const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(cancelledOrder);

        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(BadRequestException);
        await expect(deliveredOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está em preparação e não pode ser entregue`);
    });
});
