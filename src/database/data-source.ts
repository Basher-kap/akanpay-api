import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities';

config();

const dbSync = process.env.DB_SYNC === 'true';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: dbSync,
});
