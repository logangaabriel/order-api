import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'gabriellogan',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'order_api',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  autoLoadEntities: true,
  retryAttempts: 3,
  retryDelay: 3000,
};


