import dotenv from 'dotenv';
import { buildApp } from './app';
import { dbProvider } from './shared/database/database.provider';
import { initDatabase } from './shared/database/init-db';
import { seedDatabase } from './shared/database/seed';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  console.log('🚀 Iniciando EcoRoute API...');

  // Attempt database init & seed if database is available
  try {
    const isDbConnected = await dbProvider.checkConnection();
    if (isDbConnected) {
      console.log('📦 Conexão com PostgreSQL estabelecida com sucesso.');
      await initDatabase();
      await seedDatabase();
    } else {
      console.log('ℹ️ Operando com repositório em memória resiliente.');
    }
  } catch (error) {
    console.warn('⚠️ Aviso ao inicializar banco de dados:', error);
  }

  const app = await buildApp({ logger: true });

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n======================================================`);
    console.log(`🌱 EcoRoute API em execução com sucesso!`);
    console.log(`📡 URL Base:        http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs:    http://localhost:${PORT}/api/docs`);
    console.log(`🩺 Health Check:    http://localhost:${PORT}/api/v1/health`);
    console.log(`🌍 ODS 11:          Cidades e Comunidades Sustentáveis`);
    console.log(`======================================================\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando aplicação com segurança...`);
      await app.close();
      await dbProvider.close();
      process.exit(0);
    });
  }
}

bootstrap();
