#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import { consume } from './src/rabbitmq.mjs';

(async () => {
  try {
    registerExceptionHandlers();

    await consume('inbox', (msg) => {
      log.info('Received message from inbox queue', { message: msg });
    }, { durable: true, exclusive: false });

    setupShutdownHandlers();
  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
