import { validate } from 'class-validator';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('Validate reset password dto', () => {
    it('should validate a valid reset password dto without errors', async () => {
        const resetPasswordDto = new ResetPasswordDto();
        resetPasswordDto.newPassword = 'Password123!';

        const errors = await validate(resetPasswordDto);
        expect(errors.length).toBe(0);
    });

    describe('NewPassword validation', () => {
        it('should fail when newPassword is empty', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = '';

            const errors = await validate(resetPasswordDto);
            expect(errors.length).toBeGreaterThan(0);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when newPassword is not provided', async () => {
            const resetPasswordDto = new ResetPasswordDto();

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail when newPassword is not a string', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 123 as any;

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isString');
        });

        it('should fail when newPassword has less than 8 characters', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'Pass1!';

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when newPassword has no uppercase letter', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'password123!';

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when newPassword has no lowercase letter', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'PASSWORD123!';

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when newPassword has no number', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'Password!!';

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should fail when newPassword has no symbol', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'Password123';

            const errors = await validate(resetPasswordDto);
            const passwordError = errors.find(error => error.property === 'newPassword');
            expect(passwordError).toBeDefined();
            expect(passwordError?.constraints).toHaveProperty('isStrongPassword');
        });

        it('should pass when newPassword meets all requirements', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'MySecure@Pass1';

            const errors = await validate(resetPasswordDto);
            expect(errors.length).toBe(0);
        });

        it('should pass when newPassword has exactly 8 characters with all requirements', async () => {
            const resetPasswordDto = new ResetPasswordDto();
            resetPasswordDto.newPassword = 'Abcde1!@';

            const errors = await validate(resetPasswordDto);
            expect(errors.length).toBe(0);
        });
    });
});
