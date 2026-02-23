import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { FindOrderUseCase } from "../use-cases/find-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('find order', () => {
    let findOrderUseCase: FindOrderUseCase;

    const mockProduct = {
        id: 'product-uuid-1',
        name: 'Product 1',
        price: 100,
    };

    const mockOrderItem = {
        id: 'item-uuid-1',
        quantity: 2,
        unitPrice: 100,
        totalPrice: 200,
        product: mockProduct,
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

    const mockManager = {
        findAndCount: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: mockManager,
                    },
                },
            ],
        }).compile();

        findOrderUseCase = module.get<FindOrderUseCase>(FindOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated orders successfully', async () => {
            const orders = [mockOrder];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([orders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe(mockOrder.id);
            expect(result.meta.total).toBe(total);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(result.meta.totalPages).toBe(1);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: {},
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should return paginated orders with default pagination values', async () => {
            const orders = [mockOrder];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([orders, total]);

            const result = await findOrderUseCase.findAll({ page: undefined, limit: undefined } as any);

            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: {},
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter orders by PENDING status', async () => {
            const pendingOrders = [{ ...mockOrder, status: OrderStatus.PENDING }];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([pendingOrders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 }, OrderStatus.PENDING);

            expect(result.data).toHaveLength(1);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: { status: OrderStatus.PENDING },
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter orders by PAID status', async () => {
            const paidOrders = [{ ...mockOrder, status: OrderStatus.PAID }];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([paidOrders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 }, OrderStatus.PAID);

            expect(result.data).toHaveLength(1);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: { status: OrderStatus.PAID },
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter orders by PREPARING status', async () => {
            const preparingOrders = [{ ...mockOrder, status: OrderStatus.PREPARING }];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([preparingOrders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 }, OrderStatus.PREPARING);

            expect(result.data).toHaveLength(1);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: { status: OrderStatus.PREPARING },
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter orders by DELIVERED status', async () => {
            const deliveredOrders = [{ ...mockOrder, status: OrderStatus.DELIVERED }];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([deliveredOrders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 }, OrderStatus.DELIVERED);

            expect(result.data).toHaveLength(1);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: { status: OrderStatus.DELIVERED },
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter orders by CANCELLED status', async () => {
            const cancelledOrders = [{ ...mockOrder, status: OrderStatus.CANCELLED }];
            const total = 1;

            mockManager.findAndCount.mockResolvedValue([cancelledOrders, total]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 }, OrderStatus.CANCELLED);

            expect(result.data).toHaveLength(1);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: { status: OrderStatus.CANCELLED },
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should return correct pagination for page 2', async () => {
            const orders = [mockOrder];
            const total = 15;

            mockManager.findAndCount.mockResolvedValue([orders, total]);

            const result = await findOrderUseCase.findAll({ page: 2, limit: 10 });

            expect(result.meta.page).toBe(2);
            expect(result.meta.totalPages).toBe(2);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(true);
            expect(mockManager.findAndCount).toHaveBeenCalledWith(expect.anything(), {
                where: {},
                relations: ['items', 'items.product'],
                order: { createdAt: 'DESC' },
                skip: 10,
                take: 10
            });
        });

        it('should return empty data when no orders found', async () => {
            mockManager.findAndCount.mockResolvedValue([[], 0]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
            expect(result.meta.totalPages).toBe(0);
        });

        it('should map order items correctly', async () => {
            const orderWithItems = {
                ...mockOrder,
                items: [
                    { ...mockOrderItem, quantity: 2, unitPrice: 100, totalPrice: 200 },
                    { ...mockOrderItem, id: 'item-uuid-2', product: { ...mockProduct, id: 'product-uuid-2', name: 'Product 2' }, quantity: 3, unitPrice: 50, totalPrice: 150 },
                ],
            };

            mockManager.findAndCount.mockResolvedValue([[orderWithItems], 1]);

            const result = await findOrderUseCase.findAll({ page: 1, limit: 10 });

            expect(result.data[0].items).toHaveLength(2);
            expect(result.data[0].items[0].productId).toBe('product-uuid-1');
            expect(result.data[0].items[0].productName).toBe('Product 1');
            expect(result.data[0].items[1].productId).toBe('product-uuid-2');
            expect(result.data[0].items[1].productName).toBe('Product 2');
        });
    });

    describe('findById', () => {
        it('should return an order by id successfully', async () => {
            const orderId = 'order-uuid-1';

            mockManager.findOne.mockResolvedValue(mockOrder);

            const result = await findOrderUseCase.findById(orderId);

            expect(result.id).toBe(orderId);
            expect(result.customerName).toBe(mockOrder.customerName);
            expect(result.customerEmail).toBe(mockOrder.customerEmail);
            expect(result.totalAmount).toBe(mockOrder.totalAmount);
            expect(result.status).toBe(mockOrder.status);
            expect(mockManager.findOne).toHaveBeenCalledWith(expect.anything(), {
                where: { id: orderId },
                relations: ['items', 'items.product']
            });
        });

        it('should throw NotFoundException when order is not found', async () => {
            const orderId = 'order-uuid-not-found';

            mockManager.findOne.mockResolvedValue(null);

            await expect(findOrderUseCase.findById(orderId)).rejects.toThrow(NotFoundException);
            await expect(findOrderUseCase.findById(orderId)).rejects.toThrow(`Pedido com ID ${orderId} não encontrado`);
        });

        it('should return order with items mapped correctly', async () => {
            const orderId = 'order-uuid-1';
            const orderWithItems = {
                ...mockOrder,
                items: [
                    { ...mockOrderItem, quantity: 5, unitPrice: 200, totalPrice: 1000 },
                ],
            };

            mockManager.findOne.mockResolvedValue(orderWithItems);

            const result = await findOrderUseCase.findById(orderId);

            expect(result.items).toHaveLength(1);
            expect(result.items[0].productId).toBe('product-uuid-1');
            expect(result.items[0].productName).toBe('Product 1');
            expect(result.items[0].quantity).toBe(5);
            expect(result.items[0].unitPrice).toBe(200);
            expect(result.items[0].totalPrice).toBe(1000);
        });
    });
});
