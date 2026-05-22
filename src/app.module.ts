import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards';
import { AuthGuard } from './auth/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        CORS_ORIGINS: Joi.string().default(
          'http://localhost:3000,http://localhost:5173',
        ),
        SWAGGER_ENABLED: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().port().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().truthy('true').falsy('false').default(false),
        DB_MIGRATIONS_RUN: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('600s'),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        THROTTLE_TTL: Joi.number().integer().min(1).default(60),
        THROTTLE_LIMIT: Joi.number().integer().min(1).default(100),
      }),
      validationOptions: {
        abortEarly: false,
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>('THROTTLE_TTL') * 1000,
          limit: config.getOrThrow<number>('THROTTLE_LIMIT'),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV', 'development');
        const dbSync = config.get<boolean>('DB_SYNC', false);

        if (nodeEnv === 'production' && dbSync) {
          throw new Error(
            'DB_SYNC must not be enabled when NODE_ENV=production',
          );
        }

        const migrationsRun = config.get<boolean>('DB_MIGRATIONS_RUN', false);

        return {
          type: 'postgres' as const,
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.getOrThrow<number>('DB_PORT'),
          username: config.getOrThrow<string>('DB_USER'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          entities: [User],
          synchronize: dbSync,
          migrations: ['dist/migrations/*.js'],
          migrationsRun: migrationsRun && !dbSync,
        };
      },
    }),
    UserModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
