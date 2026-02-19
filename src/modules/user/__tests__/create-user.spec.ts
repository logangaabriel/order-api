import { HashingService } from 'src/modules/auth/hashing/hashing.service';
import { UserEntity } from '../entity/user.entity';
import { CreateUserUseCase } from '../use-case/create-user.use.case';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserRole } from '../enum/user-role.enum';

describe('Create User', () => {
    let useCase: CreateUserUseCase;
    let dataSource: DataSource;
    let hashingService: HashingService;

    beforeEach(async () => {
        const mockDataSource = {
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
            },
        };

        const module = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: HashingService,
                    useValue: {
                        hash: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        dataSource = module.get<DataSource>(DataSource);
        hashingService = module.get<HashingService>(HashingService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('deve criar um novo usuário com sucesso', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        const hashedPassword = 'hashedPassword';

        const savedUser = {
            id: 1,
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
        };

        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(savedUser);

        await useCase.execute(userData);

        expect(hashingService.hash).toHaveBeenCalledWith(userData.password);
        expect(dataSource.manager.save).toHaveBeenCalledWith(UserEntity, {
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
        });
    });

    it('deve lançar erro se email já estiver em uso', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(userData);

        await expect(useCase.execute(userData)).rejects.toThrow('Email já está em uso');
        expect(dataSource.manager.findOne).toHaveBeenCalledWith(UserEntity, {
            where: { email: userData.email },
        });
    });

    it('deve lançar erro se o hashing falhar', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);
        jest.spyOn(hashingService, 'hash').mockRejectedValue(new Error('Hashing failed'));

        await expect(useCase.execute(userData)).rejects.toThrow('Erro ao criar usuário');
        expect(hashingService.hash).toHaveBeenCalledWith(userData.password);
    });

    it('deve retornar usuário sem o campo password', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        const hashedPassword = 'hashedPassword';
        const savedUser = {
            id: '1',
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);
        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(savedUser);

        const result = await useCase.execute(userData);

        expect(result).not.toHaveProperty('password');
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('role');
    });

    it('deve lançar erro se o save falhar', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        const hashedPassword = 'hashedPassword';

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);
        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(dataSource.manager, 'save').mockRejectedValue(new Error('Database error'));

        await expect(useCase.execute(userData)).rejects.toThrow('Erro ao criar usuário');
        expect(dataSource.manager.save).toHaveBeenCalled();
    });

    it('deve verificar se email existe antes de criar usuário', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        const hashedPassword = 'hashedPassword';

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);
        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue({ id: '1', ...userData, password: hashedPassword, role: UserRole.USER } as any);

        await useCase.execute(userData);

        expect(dataSource.manager.findOne).toHaveBeenCalledWith(UserEntity, {
            where: { email: userData.email },
        });
        expect(dataSource.manager.save).toHaveBeenCalled();
    });

    it('deve definir role padrão como USER', async () => {
        const userData = {
            name: 'John Doe',
            email: 'gabriellogan@gmail.com',
            password: 'Password123!',
        };

        const hashedPassword = 'hashedPassword';
        const savedUser = {
            id: '1',
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
        };

        jest.spyOn(dataSource.manager, 'findOne').mockResolvedValue(null);
        jest.spyOn(hashingService, 'hash').mockResolvedValue(hashedPassword);
        jest.spyOn(dataSource.manager, 'save').mockResolvedValue(savedUser);

        await useCase.execute(userData);

        expect(dataSource.manager.save).toHaveBeenCalledWith(UserEntity, {
            ...userData,
            password: hashedPassword,
            role: UserRole.USER,
        });
    });
});