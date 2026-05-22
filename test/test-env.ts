import { config } from 'dotenv';
import { resolve } from 'path';

export function loadTestEnv(): void {
  config({ path: resolve(__dirname, '.env.e2e') });

  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
  process.env.DB_PORT = process.env.DB_PORT ?? '5432';
  process.env.DB_USER = process.env.DB_USER ?? 'root';
  process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'rootpass';
  process.env.DB_NAME = process.env.DB_NAME ?? 'akanpay-test';
  process.env.DB_SYNC = process.env.DB_SYNC ?? 'true';
  process.env.DB_MIGRATIONS_RUN = 'false';
  process.env.SWAGGER_ENABLED = 'false';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET ?? 'e2e-jwt-secret-key-minimum-32-characters';
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ??
    'e2e-jwt-refresh-secret-key-minimum-32-characters';
}

export function getTestDatabaseConfig() {
  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  };
}
