import { validate } from 'class-validator';
import { CreateUserDto } from '../dto/create-user.dto';

describe('Validate user dto', () => {
    it('should validate a valid user dto without errors', async () => {
        const createUserDto = new CreateUserDto();
        createUserDto.name = 'John Doe';
        createUserDto.email = 'john.doe@example.com';
        createUserDto.password = 'Password123!';
        
        const errors = await validate(createUserDto);
        expect(errors.length).toBe(0);
    });

    describe('Name validation', () => {
        it('should fail when name is empty', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = '';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('name');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when name is not provided', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when name is not a string', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 123 as any;
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isString');
        });

        it('should fail when name exceeds 100 characters', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'a'.repeat(101);
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when name has exactly 100 characters', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'a'.repeat(100);
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Email validation', () => {
        it('should fail when email is empty', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = '';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when email is not provided', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when email format is invalid', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'invalid-email';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should fail when email is missing @', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'invalid.email.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should fail when email is missing domain', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john@';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should pass with valid email', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Password validation', () => {
        it('should fail when password is empty', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = '';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when password is not provided', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when password is not a string', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 12345678 as any;
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isString');
        });

        it('should fail when password is less than 8 characters', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Pass1!';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when password has no uppercase letter', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'password123!';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when password has no lowercase letter', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'PASSWORD123!';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when password has no number', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password!';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when password has no symbol', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123';
            
            const errors = await validate(createUserDto);
            const passwordError = errors.find(error => error.property === 'password');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should pass with a strong password', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'john.doe@example.com';
            createUserDto.password = 'Password123!';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBe(0);
        });

        it('should pass with different valid special characters', async () => {
            const validPasswords = [
                'Password123!',
                'Password123@',
                'Password123#',
                'Password123$',
                'Password123%',
            ];

            for (const password of validPasswords) {
                const createUserDto = new CreateUserDto();
                createUserDto.name = 'John Doe';
                createUserDto.email = 'john.doe@example.com';
                createUserDto.password = password;
                
                const errors = await validate(createUserDto);
                expect(errors.length).toBe(0);
            }
        });
    });

    describe('Multiple field validation errors', () => {
        it('should return multiple errors when all fields are invalid', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = '';
            createUserDto.email = 'invalid-email';
            createUserDto.password = 'weak';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBe(3);
            expect(errors.some(e => e.property === 'name')).toBeTruthy();
            expect(errors.some(e => e.property === 'email')).toBeTruthy();
            expect(errors.some(e => e.property === 'password')).toBeTruthy();
        });

        it('should return errors only for invalid fields', async () => {
            const createUserDto = new CreateUserDto();
            createUserDto.name = 'John Doe';
            createUserDto.email = 'invalid-email';
            createUserDto.password = 'weak';
            
            const errors = await validate(createUserDto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some(e => e.property === 'name')).toBeFalsy();
            expect(errors.some(e => e.property === 'email')).toBeTruthy();
            expect(errors.some(e => e.property === 'password')).toBeTruthy();
        });
    });
});
