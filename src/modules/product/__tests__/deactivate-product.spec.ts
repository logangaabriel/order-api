import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { DeactivateProductUseCase } from "../use-cases/deactivate-product.use-case";
import { ProductEntity } from "../entity/product.entity";

describe('deactivate product', () => {
    let deactivateProductUseCase: DeactivateProductUseCase
    let productRepository: Repository<ProductEntity>;

    beforeEach( async () => {
        const module = await Test.createTestingModule({
            providers: [ DeactivateProductUseCase, {
                provide: getRepositoryToken(ProductEntity),
                useValue: {
                    findOne: jest.fn(),
                    save: jest.fn(),
                },
            }],
        }).compile();

        deactivateProductUseCase = module.get<DeactivateProductUseCase>(DeactivateProductUseCase);
        productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    });

    it('should deactivate a product successfully', async () => {
        const productId = 'uuid-1';
        const existingProduct = {
            id: productId,
            name: 'Product 1',
            description: 'Description of Product 1',
            price: 100,
            stock: 10,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(existingProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue({ ...existingProduct, active: false });

        await expect(deactivateProductUseCase.execute(productId)).resolves.not.toThrow();
        expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId, active: true } });
        expect(productRepository.save).toHaveBeenCalledWith({ ...existingProduct, active: false });
    });

    it('should throw NotFoundException when product does not exist', async () => {
        const productId = 'uuid-not-found';

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

        await expect(deactivateProductUseCase.execute(productId)).rejects.toThrow(NotFoundException);
        expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: productId, active: true } });
    });
});