import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { jwtConfig } from '../config/jwt.config';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UserEntity } from '../../user/entity/user.entity';
import { HashingService } from '../hashing/hashing.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.dataSource.manager.findOne(UserEntity, {
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      const isRefreshTokenValid = await this.hashingService.compare(
        refreshTokenDto.refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(
          { sub: user.id, email: user.email, role: user.role },
          {
            secret: this.jwtConfiguration.secret,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
            expiresIn: this.jwtConfiguration.accessTokenTtl,
          },
        ),
        this.jwtService.signAsync(
          { sub: user.id },
          {
            secret: this.jwtConfiguration.secret,
            audience: this.jwtConfiguration.audience,
            issuer: this.jwtConfiguration.issuer,
            expiresIn: this.jwtConfiguration.refreshTokenTtl,
          },
        ),
      ]);

      user.refreshTokenHash = await this.hashingService.hash(refreshToken);
      await this.dataSource.manager.save(UserEntity, user);

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }
}
