import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { HashingService } from './hashing/hashing.service';
import { Bcrypt } from './hashing/bcrypt.service';
import { LoginUseCase } from './use-cases/login.use.case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use.case';
import { LogoutUseCase } from './use-cases/logout.use.case';
import { UserEntity } from '../user/entity/user.entity';
import { jwtConfig } from './config/jwt.config';
import { AuthTokenGuard } from './guards/auth-token.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          audience: configService.get<string>('jwt.audience'),
          issuer: configService.get<string>('jwt.issuer'),
          expiresIn: configService.get<number>('jwt.accessTokenTtl'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: HashingService,
      useClass: Bcrypt,
    },
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    {
      provide: APP_GUARD,
      useClass: AuthTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [HashingService, JwtModule],
})
export class AuthModule {}
