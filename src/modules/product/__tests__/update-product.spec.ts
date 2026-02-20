import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { UpdateProductUseCase } from "../use-cases/update-product.use-case";
import { ProductEntity } from "../entity/product.entity";

describe('update product', () => {
    let updateProductUseCase: UpdateProductUseCase;
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
            providers: [UpdateProductUseCase, {
                provide: getRepositoryToken(ProductEntity),
                useValue: {
                    findOne: jest.fn(),
                    save: jest.fn(),
                },
            }],
        }).compile();

        updateProductUseCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
        productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    });

    it('should update a product successfully', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            name: 'Updated Product',
            price: 150,
        };
        const updatedProduct = { ...mockProduct, ...updateProductDto };

        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(mockProduct);
        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

        const result = await updateProductUseCase.execute(productId, updateProductDto);

        expect(result).toEqual(updatedProduct);
        expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId, active: true } });
        expect(productRepository.save).toHaveBeenCalled();
    });

    it('should update product without changing name', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            price: 200,
            stock: 20,
        };
        const updatedProduct = { ...mockProduct, ...updateProductDto };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

        const result = await updateProductUseCase.execute(productId, updateProductDto);

        expect(result).toEqual(updatedProduct);
        expect(productRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update product when name is the same', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            name: 'Product 1',
            price: 200,
        };
        const updatedProduct = { ...mockProduct, ...updateProductDto };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

        const result = await updateProductUseCase.execute(productId, updateProductDto);

        expect(result).toEqual(updatedProduct);
        expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId, active: true } });
    });

    it('should throw NotFoundException when product does not exist', async () => {
        const productId = 'uuid-not-found';
        const updateProductDto = {
            name: 'Updated Product',
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

        await expect(updateProductUseCase.execute(productId, updateProductDto)).rejects.toThrow(NotFoundException);
        expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId, active: true } });
    });

    it('should throw NotFoundException with correct message', async () => {
        const productId = 'uuid-not-found';
        const updateProductDto = {
            name: 'Updated Product',
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

        await expect(updateProductUseCase.execute(productId, updateProductDto)).rejects.toThrow('Produto não encontrado');
    });

    it('should throw ConflictException when product name already exists', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            name: 'Existing Product',
        };
        const existingProduct = {
            ...mockProduct,
            id: 'uuid-2',
            name: 'Existing Product',
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(mockProduct);
        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(existingProduct);

        await expect(updateProductUseCase.execute(productId, updateProductDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException with correct message', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            name: 'Existing Product',
        };
        const existingProduct = {
            ...mockProduct,
            id: 'uuid-2',
            name: 'Existing Product',
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(mockProduct);
        jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(existingProduct);

        await expect(updateProductUseCase.execute(productId, updateProductDto)).rejects.toThrow('Produto com este nome já existe');
    });

    it('should update product description', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            description: 'Updated description',
        };
        const updatedProduct = { ...mockProduct, ...updateProductDto };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

        const result = await updateProductUseCase.execute(productId, updateProductDto);

        expect(result.description).toBe('Updated description');
    });

    it('should update product stock', async () => {
        const productId = 'uuid-1';
        const updateProductDto = {
            stock: 50,
        };
        const updatedProduct = { ...mockProduct, ...updateProductDto };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

        const result = await updateProductUseCase.execute(productId, updateProductDto);

        expect(result.stock).toBe(50);
    });
});
