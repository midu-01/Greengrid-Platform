import { Server } from 'http';

import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

let server: Server;

const startServer = async (): Promise<void> => {
  server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`${signal} received. Shutting down server...`);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
};

void startServer();

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  void shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  void shutdown('uncaughtException');
});
