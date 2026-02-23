import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { LoginUseCase } from "../use-cases/login.use.case";
import { HashingService } from "../hashing/hashing.service";
import { jwtConfig } from "../config/jwt.config";
import { UserEntity } from "../../user/entity/user.entity";

describe('login use case', () => {
    let loginUseCase: LoginUseCase;
    let mockFindOne: jest.Mock;
    let mockSave: jest.Mock;
    let mockCompare: jest.Mock;
    let mockHash: jest.Mock;
    let mockSignAsync: jest.Mock;

    const mockUser = {
        id: 'user-uuid-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: 'USER',
        refreshTokenHash: null,
    };

    const mockJwtConfigValue = {
        secret: 'test-secret',
        audience: 'test-audience',
        issuer: 'test-issuer',
        accessTokenTtl: '15m',
        refreshTokenTtl: '7d',
    };

    beforeEach(async () => {
        mockFindOne = jest.fn();
        mockSave = jest.fn();
        mockCompare = jest.fn();
        mockHash = jest.fn();
        mockSignAsync = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoginUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: {
                            findOne: mockFindOne,
                            save: mockSave,
                        },
                    },
                },
                {
                    provide: HashingService,
                    useValue: {
                        compare: mockCompare,
                        hash: mockHash,
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: mockSignAsync,
                    },
                },
                {
                    provide: jwtConfig.KEY,
                    useValue: mockJwtConfigValue,
                },
            ],
        }).compile();

        loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    });

    it('should login successfully with valid credentials', async () => {
        const loginDto = {
            email: 'john@example.com',
            password: 'password123',
        };

        const accessToken = 'access-token-123';
        const refreshToken = 'refresh-token-456';
        const hashedRefreshToken = 'hashed-refresh-token';

        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce(accessToken)
            .mockResolvedValueOnce(refreshToken);
        mockHash.mockResolvedValue(hashedRefreshToken);
        mockSave.mockResolvedValue({ ...mockUser, refreshTokenHash: hashedRefreshToken });

        const result = await loginUseCase.execute(loginDto);

        expect(result.accessToken).toBe(accessToken);
        expect(result.refreshToken).toBe(refreshToken);
        expect(mockFindOne).toHaveBeenCalledWith(UserEntity, {
            where: { email: loginDto.email },
        });
        expect(mockCompare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
        expect(mockSignAsync).toHaveBeenCalledTimes(2);
        expect(mockHash).toHaveBeenCalledWith(refreshToken);
        expect(mockSave).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
        const loginDto = {
            email: 'notfound@example.com',
            password: 'password123',
        };

        mockFindOne.mockResolvedValue(null);

        await expect(loginUseCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
        await expect(loginUseCase.execute(loginDto)).rejects.toThrow('Credenciais inválidas');
        expect(mockCompare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
        const loginDto = {
            email: 'john@example.com',
            password: 'wrongpassword',
        };

        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(false);

        await expect(loginUseCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
        await expect(loginUseCase.execute(loginDto)).rejects.toThrow('Credenciais inválidas');
        expect(mockSignAsync).not.toHaveBeenCalled();
    });

    it('should generate JWT tokens with correct payload', async () => {
        const loginDto = {
            email: 'john@example.com',
            password: 'password123',
        };

        const accessToken = 'access-token-123';
        const refreshToken = 'refresh-token-456';

        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce(accessToken)
            .mockResolvedValueOnce(refreshToken);
        mockHash.mockResolvedValue('hashed-refresh-token');
        mockSave.mockResolvedValue(mockUser);

        await loginUseCase.execute(loginDto);

        expect(mockSignAsync).toHaveBeenNthCalledWith(1,
            { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
            {
                secret: mockJwtConfigValue.secret,
                audience: mockJwtConfigValue.audience,
                issuer: mockJwtConfigValue.issuer,
                expiresIn: mockJwtConfigValue.accessTokenTtl,
            }
        );

        expect(mockSignAsync).toHaveBeenNthCalledWith(2,
            { sub: mockUser.id },
            {
                secret: mockJwtConfigValue.secret,
                audience: mockJwtConfigValue.audience,
                issuer: mockJwtConfigValue.issuer,
                expiresIn: mockJwtConfigValue.refreshTokenTtl,
            }
        );
    });

    it('should save hashed refresh token to user', async () => {
        const loginDto = {
            email: 'john@example.com',
            password: 'password123',
        };

        const refreshToken = 'refresh-token-456';
        const hashedRefreshToken = 'hashed-refresh-token';

        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce('access-token')
            .mockResolvedValueOnce(refreshToken);
        mockHash.mockResolvedValue(hashedRefreshToken);
        mockSave.mockResolvedValue(mockUser);

        await loginUseCase.execute(loginDto);

        expect(mockSave).toHaveBeenCalledWith(UserEntity, {
            ...mockUser,
            refreshTokenHash: hashedRefreshToken,
        });
    });
});
