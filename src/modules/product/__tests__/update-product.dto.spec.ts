import { validate } from 'class-validator';
import { UpdateProductDto } from '../dto/update-product.dto';

describe('Validate update product dto', () => {
    it('should validate an empty update dto without errors', async () => {
        const updateProductDto = new UpdateProductDto();

        const errors = await validate(updateProductDto);
        expect(errors.length).toBe(0);
    });

    it('should validate a valid update dto with all fields', async () => {
        const updateProductDto = new UpdateProductDto();
        updateProductDto.name = 'Updated Product';
        updateProductDto.description = 'Updated description';
        updateProductDto.price = 200;
        updateProductDto.stock = 20;
        updateProductDto.active = true;

        const errors = await validate(updateProductDto);
        expect(errors.length).toBe(0);
    });

    describe('Name validation', () => {
        it('should pass when name is not provided', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.price = 100;

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when name is not a string', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 123 as any;

            const errors = await validate(updateProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isString');
        });

        it('should fail when name exceeds 100 characters', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'a'.repeat(101);

            const errors = await validate(updateProductDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when name has exactly 100 characters', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'a'.repeat(100);

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Description validation', () => {
        it('should pass when description is not provided', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'Product 1';

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when description is not a string', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.description = 123 as any;

            const errors = await validate(updateProductDto);
            const descriptionError = errors.find(error => error.property === 'description');
            expect(descriptionError).toBeDefined();
            expect(descriptionError?.constraints).toHaveProperty('isString');
        });

        it('should fail when description exceeds 500 characters', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.description = 'a'.repeat(501);

            const errors = await validate(updateProductDto);
            const descriptionError = errors.find(error => error.property === 'description');
            expect(descriptionError).toBeDefined();
            expect(descriptionError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when description has exactly 500 characters', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.description = 'a'.repeat(500);

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Price validation', () => {
        it('should pass when price is not provided', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'Product 1';

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when price is not a number', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.price = 'invalid' as any;

            const errors = await validate(updateProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isNumber');
        });

        it('should fail when price is negative', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.price = -10;

            const errors = await validate(updateProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isPositive');
        });

        it('should fail when price is zero', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.price = 0;

            const errors = await validate(updateProductDto);
            const priceError = errors.find(error => error.property === 'price');
            expect(priceError).toBeDefined();
            expect(priceError?.constraints).toHaveProperty('isPositive');
        });

        it('should pass when price is a positive number', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.price = 0.01;

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Stock validation', () => {
        it('should pass when stock is not provided', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'Product 1';

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when stock is not a number', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.stock = 'invalid' as any;

            const errors = await validate(updateProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('isNumber');
        });

        it('should fail when stock is less than 1', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.stock = 0;

            const errors = await validate(updateProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('min');
        });

        it('should fail when stock is negative', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.stock = -5;

            const errors = await validate(updateProductDto);
            const stockError = errors.find(error => error.property === 'stock');
            expect(stockError).toBeDefined();
            expect(stockError?.constraints).toHaveProperty('min');
        });

        it('should pass when stock is 1 or greater', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.stock = 1;

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Active validation', () => {
        it('should pass when active is not provided', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.name = 'Product 1';

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when active is true', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.active = true;

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when active is false', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.active = false;

            const errors = await validate(updateProductDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when active is not a boolean', async () => {
            const updateProductDto = new UpdateProductDto();
            updateProductDto.active = 'true' as any;

            const errors = await validate(updateProductDto);
            const activeError = errors.find(error => error.property === 'active');
            expect(activeError).toBeDefined();
            expect(activeError?.constraints).toHaveProperty('isBoolean');
        });
    });
});
