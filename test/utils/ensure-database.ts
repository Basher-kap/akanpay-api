import { Client } from 'pg';

export type DatabaseConnectionConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  maintenanceDatabase?: string;
};

export async function ensureDatabaseExists(
  config: DatabaseConnectionConfig,
): Promise<void> {
  const maintenanceDatabases = [
    config.maintenanceDatabase,
    'postgres',
    'akanpay-db',
  ].filter((name, index, list): name is string => {
    return Boolean(name) && list.indexOf(name) === index;
  });

  let lastError: unknown;

  for (const maintenanceDatabase of maintenanceDatabases) {
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: maintenanceDatabase,
    });

    try {
      await client.connect();
      const { rowCount } = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [config.database],
      );

      if (!rowCount) {
        await client.query(`CREATE DATABASE "${config.database}"`);
      }

      return;
    } catch (error) {
      lastError = error;
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  throw lastError;
}
