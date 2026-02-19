import { ResetPasswordUseCase } from '../use-case/reset-password.use.case';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HashingService } from '../../auth/hashing/hashing.service';
import { UserEntity } from '../entity/user.entity';

describe('Reset Password', () => {
    let useCase: ResetPasswordUseCase;
    let dataSource: DataSource;
    let hashingService: HashingService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ResetPasswordUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: {
                            findOne: jest.fn(),
                            save: jest.fn(),
                        },
                    },
                },
                {
                    provide: HashingService,
                    useValue: {
                        compare: jest.fn(),
                        hash: jest.fn(),
                    },
                },
            ],
        }).compile();
        
        useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
        dataSource = module.get<DataSource>(DataSource);
        hashingService = module.get<HashingService>(HashingService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve resetar senha com sucesso', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
        jest.spyOn(hashingService, 'hash').mockResolvedValue('newHashedPassword');
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(mockUser);

        await useCase.execute('123', resetPasswordDto);
        
        expect(dataSource.manager.findOne).toHaveBeenCalledWith(UserEntity, { where: { id: '123' } });
        expect(hashingService.compare).toHaveBeenCalledWith('NewP@ssw0rd!', 'oldHashedPassword');
        expect(hashingService.hash).toHaveBeenCalledWith('NewP@ssw0rd!');
        expect(dataSource.manager.save).toHaveBeenCalledWith(mockUser);
        expect(mockUser.password).toBe('newHashedPassword');
    });

    it('deve lançar NotFoundException quando usuário não for encontrado', async () => {
        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);

        await expect(useCase.execute('999', resetPasswordDto)).rejects.toThrow(NotFoundException);
        await expect(useCase.execute('999', resetPasswordDto)).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar BadRequestException quando nova senha for igual à senha antiga', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'SameP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(true);

        await expect(useCase.execute('123', resetPasswordDto)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('123', resetPasswordDto)).rejects.toThrow('A nova senha não pode ser igual à senha anterior');
        
        expect(dataSource.manager.save).not.toHaveBeenCalled();
    });

    it('não deve chamar save quando compare lançar erro', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockRejectedValue(new Error('Compare failed'));

        await expect(useCase.execute('123', resetPasswordDto)).rejects.toThrow('Compare failed');
        expect(dataSource.manager.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o hash service falhar', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
        jest.spyOn(hashingService, 'hash').mockRejectedValue(new Error('Hash failed'));

        await expect(useCase.execute('123', resetPasswordDto)).rejects.toThrow('Hash failed');
        expect(dataSource.manager.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o save falhar', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
        jest.spyOn(hashingService, 'hash').mockResolvedValue('newHashedPassword');
        jest.spyOn(dataSource.manager, 'save').mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute('123', resetPasswordDto)).rejects.toThrow('Database error');
        expect(hashingService.hash).toHaveBeenCalled();
    });

    it('deve atualizar apenas o campo password e não outras propriedades do usuário', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'NewP@ssw0rd!' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
        jest.spyOn(hashingService, 'hash').mockResolvedValue('newHashedPassword');
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(mockUser);

        await useCase.execute('123', resetPasswordDto);
        
        expect(mockUser.password).toBe('newHashedPassword');
        expect(mockUser.name).toBe('Test User');
        expect(mockUser.email).toBe('test@example.com');
        expect(mockUser.role).toBe('USER');
    });

    it('deve lidar com senha com caracteres especiais', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            password: 'oldHashedPassword',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const resetPasswordDto = { newPassword: 'C0mpl3x!@#$%^&*()' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(hashingService, 'compare').mockResolvedValue(false);
        jest.spyOn(hashingService, 'hash').mockResolvedValue('hashedComplexPassword');
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(mockUser);

        await useCase.execute('123', resetPasswordDto);
        
        expect(hashingService.hash).toHaveBeenCalledWith('C0mpl3x!@#$%^&*()');
        expect(mockUser.password).toBe('hashedComplexPassword');
    });
});
