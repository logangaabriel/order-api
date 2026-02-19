import { UpdateUserUseCase } from '../use-case/update-user.use.case';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { UserRole } from '../enum/user-role.enum';

describe('Update User', () => {
    let useCase: UpdateUserUseCase;
    let dataSource: DataSource;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UpdateUserUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: {
                            findOne: jest.fn(),
                            save: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();
        
        useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
        dataSource = module.get<DataSource>(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve atualizar usuário com sucesso', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'Old Name', 
            email: 'old@example.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { 
            name: 'New Name', 
            email: 'new@example.com' 
        };

        const updatedUser = { 
            ...mockUser, 
            ...updateDto,
            updatedAt: new Date(),
        };

        jest.spyOn(dataSource.manager, 'findOne')
            .mockResolvedValueOnce(mockUser)  
            .mockResolvedValueOnce(null);    
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(updatedUser);

        const result = await useCase.execute(userId, updateDto);
        
        expect(result.name).toBe('New Name');
        expect(result.email).toBe('new@example.com');
        expect(dataSource.manager.findOne).toHaveBeenCalledWith(UserEntity, { where: { id: userId } });
        expect(dataSource.manager.save).toHaveBeenCalled();
    });

    it('deve lançar erro quando usuário não for encontrado', async () => {
        const userId = '999';
        const updateDto = { name: 'New Name' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);

        await expect(useCase.execute(userId, updateDto)).rejects.toThrow('Usuário não encontrado');
        expect(dataSource.manager.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando email já estiver em uso por outro usuário', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User 1', 
            email: 'user1@example.com',
            role: UserRole.USER,
        };

        const existingUser = { 
            id: '456', 
            name: 'User 2', 
            email: 'existing@example.com',
            role: UserRole.USER,
        };

        const updateDto = { email: 'existing@example.com' };

        jest.spyOn(dataSource.manager, 'findOne')
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(existingUser);

        await expect(useCase.execute(userId, updateDto)).rejects.toThrow('Email já está em uso');
        expect(dataSource.manager.save).not.toHaveBeenCalled();
    });

    it('deve permitir atualizar para o mesmo email', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User', 
            email: 'user@example.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { 
            name: 'Updated Name',
            email: 'user@example.com' // mesmo email
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ ...mockUser, ...updateDto });

        const result = await useCase.execute(userId, updateDto);
        
        expect(result.name).toBe('Updated Name');
        expect(result.email).toBe('user@example.com');
    });

    it('deve atualizar apenas o nome', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'Old Name', 
            email: 'user@example.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { name: 'New Name' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ ...mockUser, name: 'New Name' });

        const result = await useCase.execute(userId, updateDto);
        
        expect(result.name).toBe('New Name');
        expect(result.email).toBe('user@example.com');
    });

    it('deve atualizar apenas o email', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User Name', 
            email: 'old@example.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { email: 'new@example.com' };

        jest.spyOn(dataSource.manager, 'findOne')
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(null);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ ...mockUser, email: 'new@example.com' });

        const result = await useCase.execute(userId, updateDto);
        
        expect(result.name).toBe('User Name');
        expect(result.email).toBe('new@example.com');
    });

    it('deve atualizar o role', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User', 
            email: 'user@example.com',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { role: UserRole.ADMIN };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ ...mockUser, role: UserRole.ADMIN });

        const result = await useCase.execute(userId, updateDto);
        
        expect(result.role).toBe(UserRole.ADMIN);
    });

    it('deve lançar erro quando o save falhar', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User', 
            email: 'user@example.com',
            role: UserRole.USER,
        };

        const updateDto = { name: 'New Name' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'save').mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(userId, updateDto)).rejects.toThrow('Database error');
    });

    it('deve retornar usuário sem o campo password', async () => {
        const userId = '123';
        const mockUser = { 
            id: userId, 
            name: 'User', 
            email: 'user@example.com',
            password: 'hashedPassword',
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updateDto = { name: 'New Name' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ ...mockUser, ...updateDto });

        const result = await useCase.execute(userId, updateDto);
        
        expect(result).not.toHaveProperty('password');
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('role');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('updatedAt');
    });
});
