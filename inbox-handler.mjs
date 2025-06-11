#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';

(async () => {
  try {
    registerExceptionHandlers();

    // Do Stuff

    setupShutdownHandlers();
  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
