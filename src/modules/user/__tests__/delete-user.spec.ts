import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DeleteUserUseCase } from '../use-case/delete-user.use.case';
import { NotFoundException } from '@nestjs/common';


describe('Delete User', () => {
    let useCase: DeleteUserUseCase;
    let dataSource: DataSource;

    beforeEach(async () => {
        const mockDataSource = {
            manager: {
                findOne: jest.fn(),
                remove: jest.fn(),
            },
        };

        const module = await Test.createTestingModule({
            providers: [
                DeleteUserUseCase,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
        dataSource = module.get<DataSource>(DataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve deletar um usuário com sucesso', async () => {
        const userId = '123';
        const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'remove').mockResolvedValue(mockUser as any);

        await useCase.execute(userId);

        expect(dataSource.manager.findOne).toHaveBeenCalledWith(expect.anything(), { where: { id: userId } });
        expect(dataSource.manager.remove).toHaveBeenCalledWith(mockUser);
    });

    it('deve lançar NotFoundException quando usuário não existir', async () => {
        const userId = '123';

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);

        await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
        await expect(useCase.execute(userId)).rejects.toThrow('Usuário não encontrado');
        expect(dataSource.manager.remove).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o remove falhar', async () => {
        const userId = '123';
        const mockUser = { id: userId, name: 'Test User', email: 'test@example.com' };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(mockUser);
        jest.spyOn(dataSource.manager, 'remove').mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(userId)).rejects.toThrow('Database error');
        expect(dataSource.manager.remove).toHaveBeenCalledWith(mockUser);
    });

    it('deve lidar com ID de usuário vazio ou inválido', async () => {
        const invalidId = '';

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);

        await expect(useCase.execute(invalidId)).rejects.toThrow(NotFoundException);
        expect(dataSource.manager.remove).not.toHaveBeenCalled();
    });
});