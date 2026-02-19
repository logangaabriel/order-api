import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductUseCase } from "../use-cases/create-product.use.case";
import { ProductEntity } from "../entity/product.entity";


describe('create product', () => {
    let createProductUseCase: CreateProductUseCase;
    let productRepository: Repository<ProductEntity>;

    beforeEach( async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ CreateProductUseCase, {
                provide: getRepositoryToken(ProductEntity),
                useValue: {
                    findOne: jest.fn(),
                    create: jest.fn(),
                    save: jest.fn(),
                },
            }],
        }).compile();

        createProductUseCase = module.get<CreateProductUseCase>(CreateProductUseCase);
        productRepository = module.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));


    });

    it('should create and save a new product successfully', async () => {
        const createProductDto = {
            name: 'Product 1',
            description: 'Description of Product 1',
            price: 100,
            stock: 10,
        };

        const createdProduct = {
            id: 'uuid-1',
            ...createProductDto,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(productRepository, 'create').mockReturnValue(createdProduct);
        jest.spyOn(productRepository, 'save').mockResolvedValue(createdProduct);
        
        await createProductUseCase.execute(createProductDto);
        
        expect(productRepository.create).toHaveBeenCalledWith(createProductDto);
        expect(productRepository.save).toHaveBeenCalledWith(createdProduct);
    });

    it('should throw an error when product name already exists', async () => {
        const createProductDto = {
            name: 'Product 1',
            description: 'Description of Product 1',
            price: 100,
            stock: 10,
        }

        const existingProduct = {
            id: 'uuid-1',
            ...createProductDto,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(existingProduct);

        await expect(createProductUseCase.execute(createProductDto)).rejects.toThrow('Produto com este nome já existe');
    });

    it('should throw an error when database fails during product creation', async () => {
        const createProductDto = {
            name: 'Product 1',
            description: 'Description of Product 1',
            price: 100,
            stock: 10,
        };

        jest.spyOn(productRepository, 'create').mockImplementation(() => {
            throw new Error('Database error');
        });

        await expect(createProductUseCase.execute(createProductDto)).rejects.toThrow('Database error');
    });
});