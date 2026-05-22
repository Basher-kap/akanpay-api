import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const nodeEnv = config.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  app.use(helmet());

  const corsOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('v1', {
    exclude: ['health', 'health/ready'],
  });

  app.useGlobalFilters(new AllExceptionsFilter(isProduction));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new LoggingInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerEnabled = isProduction
    ? config.get<boolean>('SWAGGER_ENABLED', false)
    : config.get<boolean>('SWAGGER_ENABLED', true);

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Akan Pay Web Service')
      .setDescription('Akan Pay API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
}
