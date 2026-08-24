import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function bootstrap() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 ShebaBD API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Prevent silent crashes from unhandled promise rejections / exceptions —
  // log them and shut down gracefully instead of leaving the process in a bad state.
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception:', error);
    server.close(() => process.exit(1));
  });
}

bootstrap();
