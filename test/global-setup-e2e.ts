import { ensureDatabaseExists } from './utils/ensure-database';
import { getTestDatabaseConfig, loadTestEnv } from './test-env';

export default async function globalSetup(): Promise<void> {
  loadTestEnv();
  await ensureDatabaseExists(getTestDatabaseConfig());
}
