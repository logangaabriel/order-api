import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CreateOrderUseCase } from "../use-cases/create-order.use.case";
import { OrderStatus } from "../enum/order-status.enum";

describe('create order', () => {
    let createOrderUseCase: CreateOrderUseCase;

    const mockUser = {
        id: 'user-uuid-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
    };

    const mockProduct = {
        id: 'product-uuid-1',
        name: 'Product 1',
        description: 'Description of Product 1',
        price: 100,
        stock: 10,
        active: true,
    };

    const mockManager = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        transaction: jest.fn((callback) => callback(mockManager)),
                    },
                },
            ],
        }).compile();

        createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an order successfully', async () => {
        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1'],
            items: [{ productId: 'product-uuid-1', quantity: 2 }],
        };

        const mockOrderItem = {
            product: mockProduct,
            quantity: 2,
            unitPrice: 100,
            totalPrice: 200,
        };

        const mockOrder = {
            id: 'order-uuid-1',
            customerName: 'John Doe',
            customerId: 'user-uuid-1',
            customerEmail: 'john@example.com',
            totalAmount: 200,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            items: [mockOrderItem],
            users: [mockUser],
        };

        mockManager.find.mockResolvedValue([mockUser]);
        mockManager.findOne.mockResolvedValue(mockProduct);
        mockManager.create.mockImplementation((entity, data) => data);
        mockManager.save.mockResolvedValue(mockOrder);

        const result = await createOrderUseCase.execute(createOrderDto);

        expect(result.id).toBe(mockOrder.id);
        expect(result.customerName).toBe(mockOrder.customerName);
        expect(result.totalAmount).toBe(200);
        expect(result.status).toBe(OrderStatus.PENDING);
        expect(mockManager.find).toHaveBeenCalled();
        expect(mockManager.findOne).toHaveBeenCalled();
        expect(mockManager.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-not-found'],
            items: [{ productId: 'product-uuid-1', quantity: 2 }],
        };

        mockManager.find.mockResolvedValue([]);

        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow(NotFoundException);
        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow('Usuários não encontrados: user-uuid-not-found');
    });

    it('should throw NotFoundException when product is not found', async () => {
        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1'],
            items: [{ productId: 'product-uuid-not-found', quantity: 2 }],
        };

        mockManager.find.mockResolvedValue([mockUser]);
        mockManager.findOne.mockResolvedValue(null);

        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow(NotFoundException);
        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow('Produto com ID product-uuid-not-found não encontrado ou inativo');
    });

    it('should throw BadRequestException when product stock is insufficient', async () => {
        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1'],
            items: [{ productId: 'product-uuid-1', quantity: 100 }],
        };

        const lowStockProduct = { ...mockProduct, stock: 5 };

        mockManager.find.mockResolvedValue([mockUser]);
        mockManager.findOne.mockResolvedValue(lowStockProduct);

        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow(BadRequestException);
        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow(`Estoque insuficiente para o produto ${mockProduct.name}`);
    });

    it('should create order with multiple items', async () => {
        const mockProduct2 = {
            id: 'product-uuid-2',
            name: 'Product 2',
            price: 50,
            stock: 20,
            active: true,
        };

        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1'],
            items: [
                { productId: 'product-uuid-1', quantity: 2 },
                { productId: 'product-uuid-2', quantity: 3 },
            ],
        };

        const mockOrder = {
            id: 'order-uuid-1',
            customerName: 'John Doe',
            customerId: 'user-uuid-1',
            customerEmail: 'john@example.com',
            totalAmount: 350, // (100 * 2) + (50 * 3)
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            items: [],
            users: [mockUser],
        };

        mockManager.find.mockResolvedValue([mockUser]);
        mockManager.findOne
            .mockResolvedValueOnce(mockProduct)
            .mockResolvedValueOnce(mockProduct2);
        mockManager.create.mockImplementation((entity, data) => data);
        mockManager.save.mockResolvedValue(mockOrder);

        const result = await createOrderUseCase.execute(createOrderDto);

        expect(result.totalAmount).toBe(350);
        expect(mockManager.findOne).toHaveBeenCalledTimes(2);
    });

    it('should create order with multiple users', async () => {
        const mockUser2 = {
            id: 'user-uuid-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'USER',
        };

        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1', 'user-uuid-2'],
            items: [{ productId: 'product-uuid-1', quantity: 2 }],
        };

        const mockOrder = {
            id: 'order-uuid-1',
            customerName: 'John Doe',
            customerId: 'user-uuid-1',
            customerEmail: 'john@example.com',
            totalAmount: 200,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            items: [],
            users: [mockUser, mockUser2],
        };

        mockManager.find.mockResolvedValue([mockUser, mockUser2]);
        mockManager.findOne.mockResolvedValue(mockProduct);
        mockManager.create.mockImplementation((entity, data) => data);
        mockManager.save.mockResolvedValue(mockOrder);

        const result = await createOrderUseCase.execute(createOrderDto);

        expect(result.users).toHaveLength(2);
        expect(result.users[0].id).toBe('user-uuid-1');
        expect(result.users[1].id).toBe('user-uuid-2');
    });

    it('should throw NotFoundException when some users are not found', async () => {
        const createOrderDto = {
            customerName: 'John Doe',
            userIds: ['user-uuid-1', 'user-uuid-not-found'],
            items: [{ productId: 'product-uuid-1', quantity: 2 }],
        };

        mockManager.find.mockResolvedValue([mockUser]);

        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow(NotFoundException);
        await expect(createOrderUseCase.execute(createOrderDto)).rejects.toThrow('Usuários não encontrados: user-uuid-not-found');
    });
});
