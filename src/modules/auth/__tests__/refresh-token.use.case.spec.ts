import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokenUseCase } from "../use-cases/refresh-token.use.case";
import { HashingService } from "../hashing/hashing.service";
import { jwtConfig } from "../config/jwt.config";
import { UserEntity } from "../../user/entity/user.entity";

describe('refresh token use case', () => {
    let refreshTokenUseCase: RefreshTokenUseCase;
    let mockFindOne: jest.Mock;
    let mockSave: jest.Mock;
    let mockCompare: jest.Mock;
    let mockHash: jest.Mock;
    let mockVerifyAsync: jest.Mock;
    let mockSignAsync: jest.Mock;

    const mockUser = {
        id: 'user-uuid-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: 'USER',
        refreshTokenHash: 'hashed-refresh-token',
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
        mockVerifyAsync = jest.fn();
        mockSignAsync = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefreshTokenUseCase,
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
                        verifyAsync: mockVerifyAsync,
                        signAsync: mockSignAsync,
                    },
                },
                {
                    provide: jwtConfig.KEY,
                    useValue: mockJwtConfigValue,
                },
            ],
        }).compile();

        refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: mockUser.id };
        const newAccessToken = 'new-access-token-123';
        const newRefreshToken = 'new-refresh-token-456';
        const hashedNewRefreshToken = 'hashed-new-refresh-token';

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce(newAccessToken)
            .mockResolvedValueOnce(newRefreshToken);
        mockHash.mockResolvedValue(hashedNewRefreshToken);
        mockSave.mockResolvedValue({ ...mockUser, refreshTokenHash: hashedNewRefreshToken });

        const result = await refreshTokenUseCase.execute(refreshTokenDto);

        expect(result.accessToken).toBe(newAccessToken);
        expect(result.refreshToken).toBe(newRefreshToken);
        expect(mockVerifyAsync).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
            secret: mockJwtConfigValue.secret,
            audience: mockJwtConfigValue.audience,
            issuer: mockJwtConfigValue.issuer,
        });
        expect(mockFindOne).toHaveBeenCalledWith(UserEntity, {
            where: { id: payload.sub },
        });
        expect(mockCompare).toHaveBeenCalledWith(refreshTokenDto.refreshToken, 'hashed-refresh-token');
    });

    it('should throw UnauthorizedException when refresh token verification fails', async () => {
        const refreshTokenDto = {
            refreshToken: 'invalid-refresh-token',
        };

        mockVerifyAsync.mockRejectedValue(new Error('Invalid token'));

        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: 'user-uuid-not-found' };

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(null);

        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should throw UnauthorizedException when user has no refresh token hash', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: mockUser.id };
        const userWithoutRefreshToken = { ...mockUser, refreshTokenHash: null };

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(userWithoutRefreshToken);

        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should throw UnauthorizedException when refresh token does not match stored hash', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: mockUser.id };

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(false);

        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
        await expect(refreshTokenUseCase.execute(refreshTokenDto)).rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should generate new JWT tokens with correct payload', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: mockUser.id };
        const newAccessToken = 'new-access-token-123';
        const newRefreshToken = 'new-refresh-token-456';

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce(newAccessToken)
            .mockResolvedValueOnce(newRefreshToken);
        mockHash.mockResolvedValue('hashed-new-refresh-token');
        mockSave.mockResolvedValue(mockUser);

        await refreshTokenUseCase.execute(refreshTokenDto);

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

    it('should save new hashed refresh token to user', async () => {
        const refreshTokenDto = {
            refreshToken: 'valid-refresh-token',
        };

        const payload = { sub: mockUser.id };
        const newRefreshToken = 'new-refresh-token-456';
        const hashedNewRefreshToken = 'hashed-new-refresh-token';

        mockVerifyAsync.mockResolvedValue(payload);
        mockFindOne.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);
        mockSignAsync
            .mockResolvedValueOnce('new-access-token')
            .mockResolvedValueOnce(newRefreshToken);
        mockHash.mockResolvedValue(hashedNewRefreshToken);
        mockSave.mockResolvedValue(mockUser);

        await refreshTokenUseCase.execute(refreshTokenDto);

        expect(mockSave).toHaveBeenCalledWith(UserEntity, {
            ...mockUser,
            refreshTokenHash: hashedNewRefreshToken,
        });
    });
});
