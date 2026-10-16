import dotenv from 'dotenv';
import { buildApp } from './app';
import { dbProvider } from './shared/database/database.provider';
import { initDatabase } from './shared/database/init-db';
import { seedDatabase } from './shared/database/seed';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  const isDbConnected = await dbProvider.checkConnection();
  if (isDbConnected) {
    await initDatabase();
    await seedDatabase();
  }

  const app = await buildApp({ logger: true });

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`EcoRoute API listening on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      await app.close();
      await dbProvider.close();
      process.exit(0);
    });
  }
}

bootstrap();
