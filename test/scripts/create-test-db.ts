import { ensureDatabaseExists } from '../utils/ensure-database';
import { getTestDatabaseConfig, loadTestEnv } from '../test-env';

async function main() {
  loadTestEnv();
  const config = getTestDatabaseConfig();
  await ensureDatabaseExists(config);
  console.log(`Database "${config.database}" is ready.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
