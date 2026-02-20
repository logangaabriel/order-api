import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { FindProductsUseCase } from "../use-cases/find-products.use-case";
import { ProductEntity } from "../entity/product.entity";

describe('find products', () => {
    let findProductsUseCase: FindProductsUseCase;
    let productRepository: Repository<ProductEntity>;

    const mockProduct = {
        id: 'uuid-1',
        name: 'Product 1',
        description: 'Description of Product 1',
        price: 100,
        stock: 10,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FindProductsUseCase, {
                provide: getRepositoryToken(ProductEntity),
                useValue: {
                    findOne: jest.fn(),
                    findAndCount: jest.fn(),
                },
            }],
        }).compile();

        findProductsUseCase = module.get<FindProductsUseCase>(FindProductsUseCase);
        productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    });

    describe('findAll', () => {
        it('should return paginated products successfully', async () => {
            const products = [mockProduct];
            const total = 1;

            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

            const result = await findProductsUseCase.findAll({ page: 1, limit: 10 });

            expect(result.data).toEqual(products);
            expect(result.meta.total).toBe(total);
            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(result.meta.totalPages).toBe(1);
            expect(result.meta.hasNextPage).toBe(false);
            expect(result.meta.hasPreviousPage).toBe(false);
            expect(productRepository.findAndCount).toHaveBeenCalledWith({
                where: {},
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should return paginated products with default pagination values', async () => {
            const products = [mockProduct];
            const total = 1;

            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

            const result = await findProductsUseCase.findAll({ page: undefined, limit: undefined } as any);

            expect(result.meta.page).toBe(1);
            expect(result.meta.limit).toBe(10);
            expect(productRepository.findAndCount).toHaveBeenCalledWith({
                where: {},
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter active products when status is active', async () => {
            const products = [mockProduct];
            const total = 1;

            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

            const result = await findProductsUseCase.findAll({ page: 1, limit: 10 }, 'active');

            expect(result.data).toEqual(products);
            expect(productRepository.findAndCount).toHaveBeenCalledWith({
                where: { active: true },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should filter inactive products when status is inactive', async () => {
            const inactiveProduct = { ...mockProduct, active: false };
            const products = [inactiveProduct];
            const total = 1;

            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

            const result = await findProductsUseCase.findAll({ page: 1, limit: 10 }, 'inactive');

            expect(result.data).toEqual(products);
            expect(productRepository.findAndCount).toHaveBeenCalledWith({
                where: { active: false },
                order: { createdAt: 'DESC' },
                skip: 0,
                take: 10
            });
        });

        it('should return correct pagination meta for multiple pages', async () => {
            const products = [mockProduct];
            const total = 25;

            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

            const result = await findProductsUseCase.findAll({ page: 2, limit: 10 });

            expect(result.meta.total).toBe(25);
            expect(result.meta.page).toBe(2);
            expect(result.meta.totalPages).toBe(3);
            expect(result.meta.hasNextPage).toBe(true);
            expect(result.meta.hasPreviousPage).toBe(true);
            expect(productRepository.findAndCount).toHaveBeenCalledWith({
                where: {},
                order: { createdAt: 'DESC' },
                skip: 10,
                take: 10
            });
        });

        it('should return empty array when no products found', async () => {
            jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([[], 0]);

            const result = await findProductsUseCase.findAll({ page: 1, limit: 10 });

            expect(result.data).toEqual([]);
            expect(result.meta.total).toBe(0);
            expect(result.meta.totalPages).toBe(0);
        });
    });

    describe('findById', () => {
        it('should return a product by id successfully', async () => {
            const productId = 'uuid-1';

            jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);

            const result = await findProductsUseCase.findById(productId);

            expect(result).toEqual(mockProduct);
            expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
        });

        it('should throw NotFoundException when product does not exist', async () => {
            const productId = 'uuid-not-found';

            jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

            await expect(findProductsUseCase.findById(productId)).rejects.toThrow(NotFoundException);
            expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId } });
        });

        it('should throw NotFoundException with correct message', async () => {
            const productId = 'uuid-not-found';

            jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

            await expect(findProductsUseCase.findById(productId)).rejects.toThrow('Produto não encontrado');
        });
    });
});
