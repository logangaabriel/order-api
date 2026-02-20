import { validate } from 'class-validator';
import { CreateProductDto } from '../dto/create-product.dto';

describe('Validate create product dto', () => {
    it('should validate a valid product dto without errors', async () => {
        const createProductDto = new CreateProductDto();
        createProductDto.name = 'Product 1';
        createProductDto.description = 'Description of Product 1';
        createProductDto.price = 100;
        createProductDto.stock = 10;

        const errors = await validate(createProductDto);
        expect(errors.length).toBe(0);
    });

    it('should validate a valid product dto without description', async () => {
        const createProductDto = new CreateProductDto();
        createProductDto.name = 'Product 1';
        createProductDto.price = 100;
        createProductDto.stock = 10;

        const errors = await validate(createProductDto);
        expect(errors.length).toBe(0);
    });

    describe('Name validation', () => {
        it('should fail when name is empty', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = '';
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when name is not provided', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when name is not a string', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 123 as any;
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isString');
        });

        it('should fail when name exceeds 100 characters', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'a'.repeat(101);
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when name has exactly 100 characters', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'a'.repeat(100);
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Description validation', () => {
        it('should pass when description is not provided', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when description is not a string', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.description = 123 as any;
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const descriptionError = errors.find(error => error.property === 'description');
            expect(descriptionError).toBeDefined();
            expect(descriptionError?.constraints).toHaveProperty('isString');
        });

        it('should fail when description exceeds 500 characters', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.description = 'a'.repeat(501);
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const descriptionError = errors.find(error => error.property === 'description');
            expect(descriptionError).toBeDefined();
            expect(descriptionError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when description has exactly 500 characters', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.description = 'a'.repeat(500);
            createProductDto.price = 100;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Price validation', () => {
        it('should fail when price is not provided', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when price is not a number', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 'invalid' as any;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isNumber');
        });

        it('should fail when price is negative', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = -10;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isPositive');
        });

        it('should fail when price is zero', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 0;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isPositive');
        });

        it('should pass when price is a positive number', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 0.01;
            createProductDto.stock = 10;

            const errors = await validate(createProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Stock validation', () => {
        it('should fail when stock is not provided', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;

            const errors = await validate(createProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when stock is not a number', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;
            createProductDto.stock = 'invalid' as any;

            const errors = await validate(createProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('isNumber');
        });

        it('should fail when stock is less than 1', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;
            createProductDto.stock = 0;

            const errors = await validate(createProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('min');
        });

        it('should fail when stock is negative', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;
            createProductDto.stock = -5;

            const errors = await validate(createProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('min');
        });

        it('should pass when stock is 1 or greater', async () => {
            const createProductDto = new CreateProductDto();
            createProductDto.name = 'Product 1';
            createProductDto.price = 100;
            createProductDto.stock = 1;

            const errors = await validate(createProductDto);
            expect(errors.length).toBe(0);
        });
    });
});
