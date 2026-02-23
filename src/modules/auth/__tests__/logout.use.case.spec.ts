import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { LogoutUseCase } from "../use-cases/logout.use.case";
import { UserEntity } from "../../user/entity/user.entity";

describe('logout use case', () => {
    let logoutUseCase: LogoutUseCase;
    let mockUpdate: jest.Mock;

    beforeEach(async () => {
        mockUpdate = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LogoutUseCase,
                {
                    provide: DataSource,
                    useValue: {
                        manager: {
                            update: mockUpdate,
                        },
                    },
                },
            ],
        }).compile();

        logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    });

    it('should logout user successfully by clearing refresh token', async () => {
        const userId = 'user-uuid-1';

        mockUpdate.mockResolvedValue({ affected: 1 });

        await logoutUseCase.execute(userId);

        expect(mockUpdate).toHaveBeenCalledWith(
            UserEntity,
            { id: userId },
            { refreshTokenHash: null }
        );
    });

    it('should clear refresh token even if user does not exist', async () => {
        const userId = 'user-uuid-not-found';

        mockUpdate.mockResolvedValue({ affected: 0 });

        await expect(logoutUseCase.execute(userId)).resolves.not.toThrow();
        expect(mockUpdate).toHaveBeenCalledWith(
            UserEntity,
            { id: userId },
            { refreshTokenHash: null }
        );
    });

    it('should return void on successful logout', async () => {
        const userId = 'user-uuid-1';

        mockUpdate.mockResolvedValue({ affected: 1 });

        const result = await logoutUseCase.execute(userId);

        expect(result).toBeUndefined();
    });
});
