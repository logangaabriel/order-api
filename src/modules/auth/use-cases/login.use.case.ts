import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { LoginDto } from '../dto/login.dto';
import { UserEntity } from '../../user/entity/user.entity';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingService,
    
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(loginDto: LoginDto) {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await this.hashingService.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
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
  }
}