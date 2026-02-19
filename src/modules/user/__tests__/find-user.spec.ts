import { FindUserUseCase } from '../use-case/find-user.use.case';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../entity/user.entity';

describe('Find User', () => {
    let useCase: FindUserUseCase;
    let dataSource: DataSource;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                FindUserUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: {
                            findOne: jest.fn(),
                            findAndCount: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();
        
        useCase = module.get<FindUserUseCase>(FindUserUseCase);
        dataSource = module.get<DataSource>(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve encontrar um usuário por ID', async () => {
        const mockUser = { 
            id: '123', 
            name: 'Test User', 
            email: 'test@example.com',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);

        const result = await useCase.execute('123');
        
        expect(result).toEqual({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            createdAt: mockUser.createdAt,
            updatedAt: mockUser.updatedAt,
        });
        expect(dataSource.manager.findOne).toHaveBeenCalledWith(UserEntity, { where: { id: '123' } });
    });

    it('deve lançar NotFoundException quando usuário não for encontrado', async () => {
        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);

        await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
        await expect(useCase.execute('999')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve encontrar todos os usuários com paginação', async () => {
        const mockUsers = [
            { id: '123', name: 'Test User 1', email: 'test1@example.com', role: 'USER', createdAt: new Date(), updatedAt: new Date() },
            { id: '124', name: 'Test User 2', email: 'test2@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
        ];

        jest.spyOn(dataSource.manager, 'findAndCount').mockResolvedValue([mockUsers, 2]);

        const result = await useCase.findAll({ page: 1, limit: 10 });
        
        expect(result.data).toHaveLength(2);
        expect(result.meta.total).toBe(2);
        expect(result.meta.page).toBe(1);
        expect(result.meta.limit).toBe(10);
        expect(dataSource.manager.findAndCount).toHaveBeenCalledWith(UserEntity, {
            where: {},
            order: { createdAt: 'DESC' },
            skip: 0,
            take: 10,
        });
    });

    it('deve encontrar todos os usuários filtrados por role', async () => {
        const mockUsers = [
            { id: '123', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
        ];

        jest.spyOn(dataSource.manager, 'findAndCount').mockResolvedValue([mockUsers, 1]);

        const result = await useCase.findAll({ page: 1, limit: 10 }, 'ADMIN' as any);
        
        expect(result.data).toHaveLength(1);
        expect(result.data[0].role).toBe('ADMIN');
        expect(dataSource.manager.findAndCount).toHaveBeenCalledWith(UserEntity, {
            where: { role: 'ADMIN' },
            order: { createdAt: 'DESC' },
            skip: 0,
            take: 10,
        });
    });

    it('deve lidar com paginação em diferentes páginas', async () => {
        const mockUsers = [
            { id: '125', name: 'Test User 3', email: 'test3@example.com', role: 'USER', createdAt: new Date(), updatedAt: new Date() },
        ];

        jest.spyOn(dataSource.manager, 'findAndCount').mockResolvedValue([mockUsers, 25]);

        const result = await useCase.findAll({ page: 3, limit: 10 });
        
        expect(result.meta.page).toBe(3);
        expect(result.meta.totalPages).toBe(3);
        expect(result.meta.hasNextPage).toBe(false);
        expect(result.meta.hasPreviousPage).toBe(true);
        expect(dataSource.manager.findAndCount).toHaveBeenCalledWith(UserEntity, {
            where: {},
            order: { createdAt: 'DESC' },
            skip: 20,
            take: 10,
        });
    });

    it('deve lidar com tamanho de página pequeno', async () => {
        const mockUsers = [
            { id: '123', name: 'Test User 1', email: 'test1@example.com', role: 'USER', createdAt: new Date(), updatedAt: new Date() },
            { id: '124', name: 'Test User 2', email: 'test2@example.com', role: 'USER', createdAt: new Date(), updatedAt: new Date() },
        ];

        jest.spyOn(dataSource.manager, 'findAndCount').mockResolvedValue([mockUsers, 10]);

        const result = await useCase.findAll({ page: 1, limit: 2 });
        
        expect(result.meta.limit).toBe(2);
        expect(result.meta.totalPages).toBe(5);
        expect(result.meta.hasNextPage).toBe(true);
    });

    it('deve retornar array vazio quando nenhum usuário for encontrado', async () => {
        jest.spyOn(dataSource.manager, 'findAndCount').mockResolvedValue([[], 0]);

        const result = await useCase.findAll({ page: 1, limit: 10 });
        
        expect(result.data).toHaveLength(0);
        expect(result.meta.total).toBe(0);
        expect(result.meta.totalPages).toBe(0);
    });
});