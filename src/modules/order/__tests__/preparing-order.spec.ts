import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { PreparingOrderUseCase } from "../use-cases/preparing-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('preparing order', () => {
    let preparingOrderUseCase: PreparingOrderUseCase;

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
        status: OrderStatus.PAID,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PreparingOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn((callback) => callback(mockManager)),
                    },
                },
            ],
        }).compile();

        preparingOrderUseCase = module.get<PreparingOrderUseCase>(PreparingOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should start preparing a paid order successfully', async () => {
        const orderId = 'order-uuid-1';
        const paidOrder = { ...mockOrder, status: OrderStatus.PAID };
        const preparingOrder = { ...paidOrder, status: OrderStatus.PREPARING };

        mockManager.findOne.mockResolvedValue(paidOrder);
        mockManager.save.mockResolvedValue(preparingOrder);

        const result = await preparingOrderUseCase.execute(orderId);

        expect(result.id).toBe(orderId);
        expect(result.status).toBe(OrderStatus.PREPARING);
        expect(mockManager.findOne).toHaveBeenCalledWith(expect.anything(), {
            where: { id: orderId }
        });
        expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when order is not found', async () => {
        const orderId = 'order-uuid-not-found';

        mockManager.findOne.mockResolvedValue(null);

        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não encontrado`);
    });

    it('should throw NotFoundException when order is pending', async () => {
        const orderId = 'order-uuid-1';
        const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };

        mockManager.findOne.mockResolvedValue(pendingOrder);

        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está pago e não pode ser preparado`);
    });

    it('should throw NotFoundException when order is already preparing', async () => {
        const orderId = 'order-uuid-1';
        const preparingOrder = { ...mockOrder, status: OrderStatus.PREPARING };

        mockManager.findOne.mockResolvedValue(preparingOrder);

        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está pago e não pode ser preparado`);
    });

    it('should throw NotFoundException when order is delivered', async () => {
        const orderId = 'order-uuid-1';
        const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };

        mockManager.findOne.mockResolvedValue(deliveredOrder);

        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está pago e não pode ser preparado`);
    });

    it('should throw NotFoundException when order is cancelled', async () => {
        const orderId = 'order-uuid-1';
        const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

        mockManager.findOne.mockResolvedValue(cancelledOrder);

        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(NotFoundException);
        await expect(preparingOrderUseCase.execute(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não está pago e não pode ser preparado`);
    });
});
