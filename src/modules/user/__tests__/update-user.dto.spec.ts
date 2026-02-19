import { validate } from 'class-validator';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../enum/user-role.enum';

describe('Validate update user dto', () => {
    it('should validate a valid update user dto without errors', async () => {
        const updateUserDto = new UpdateUserDto();
        updateUserDto.name = 'John Doe';
        updateUserDto.email = 'john.doe@example.com';
        updateUserDto.role = UserRole.USER;

        const errors = await validate(updateUserDto);
        expect(errors.length).toBe(0);
    });

    it('should validate an empty dto without errors (all fields are optional)', async () => {
        const updateUserDto = new UpdateUserDto();

        const errors = await validate(updateUserDto);
        expect(errors.length).toBe(0);
    });

    describe('Name validation', () => {
        it('should pass when only name is provided', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'John Doe';

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when name is not a string', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 123 as any;

            const errors = await validate(updateUserDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('isString');
        });

        it('should fail when name exceeds 100 characters', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'a'.repeat(101);

            const errors = await validate(updateUserDto);
            const nameError = errors.find(error => error.property === 'name');
            expect(nameError).toBeDefined();
            expect(nameError?.constraints).toHaveProperty('maxLength');
        });

        it('should pass when name has exactly 100 characters', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'a'.repeat(100);

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when name is empty string (optional field)', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = '';

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });
    });

    describe('Email validation', () => {
        it('should pass when only email is provided', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.email = 'john.doe@example.com';

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when email format is invalid', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.email = 'invalid-email';

            const errors = await validate(updateUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should fail when email is missing @', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.email = 'johndoe.example.com';

            const errors = await validate(updateUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should fail when email is missing domain', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.email = 'johndoe@';

            const errors = await validate(updateUserDto);
            const emailError = errors.find(error => error.property === 'email');
            expect(emailError).toBeDefined();
            expect(emailError?.constraints).toHaveProperty('isEmail');
        });

        it('should pass with valid email formats', async () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.org',
                'user+tag@example.co.uk',
            ];

            for (const email of validEmails) {
                const updateUserDto = new UpdateUserDto();
                updateUserDto.email = email;

                const errors = await validate(updateUserDto);
                expect(errors.length).toBe(0);
            }
        });
    });

    describe('Role validation', () => {
        it('should pass when only role is provided with valid value USER', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.role = UserRole.USER;

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when only role is provided with valid value ADMIN', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.role = UserRole.ADMIN;

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when role is not a valid enum value', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.role = 'INVALID_ROLE' as any;

            const errors = await validate(updateUserDto);
            const roleError = errors.find(error => error.property === 'role');
            expect(roleError).toBeDefined();
            expect(roleError?.constraints).toHaveProperty('isEnum');
        });

        it('should fail when role is a lowercase valid value', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.role = 'admin' as any;

            const errors = await validate(updateUserDto);
            const roleError = errors.find(error => error.property === 'role');
            expect(roleError).toBeDefined();
            expect(roleError?.constraints).toHaveProperty('isEnum');
        });

        it('should fail when role is a number', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.role = 1 as any;

            const errors = await validate(updateUserDto);
            const roleError = errors.find(error => error.property === 'role');
            expect(roleError).toBeDefined();
            expect(roleError?.constraints).toHaveProperty('isEnum');
        });
    });

    describe('Combined fields validation', () => {
        it('should pass when name and email are provided', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'Jane Doe';
            updateUserDto.email = 'jane.doe@example.com';

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when name and role are provided', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'Jane Doe';
            updateUserDto.role = UserRole.ADMIN;

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when email and role are provided', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.email = 'jane.doe@example.com';
            updateUserDto.role = UserRole.ADMIN;

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(0);
        });

        it('should fail when multiple fields have invalid values', async () => {
            const updateUserDto = new UpdateUserDto();
            updateUserDto.name = 'a'.repeat(101);
            updateUserDto.email = 'invalid-email';
            updateUserDto.role = 'INVALID' as any;

            const errors = await validate(updateUserDto);
            expect(errors.length).toBe(3);

            const nameError = errors.find(error => error.property === 'name');
            const emailError = errors.find(error => error.property === 'email');
            const roleError = errors.find(error => error.property === 'role');

            expect(nameError?.constraints).toHaveProperty('maxLength');
            expect(emailError?.constraints).toHaveProperty('isEmail');
            expect(roleError?.constraints).toHaveProperty('isEnum');
        });
    });
});
