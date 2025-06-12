#!/usr/bin/env node
import 'dotenv/config';
import log from './src/log.mjs';
import { registerExceptionHandlers } from './src/exceptions.mjs';
import { setupShutdownHandlers } from './src/shutdown.mjs';
import { consume, publish } from './src/rabbitmq.mjs';

(async () => {
  try {
    registerExceptionHandlers();

    await consume('inbox', async (msg) => {
      log.debug('Received message from inbox queue', { message: JSON.stringify(msg) });
      // Extract fields
      const rsvp = msg.rsvp;
      const guildId = msg.guildId;
      const channelId = msg.channelId;
      const author = msg.authorNickname || msg.authorUsername || 'Unknown';
      const originalContent = msg.message && msg.message.content ? msg.message.content : '';
      const content = `${author} said: ${originalContent}`;
      // Publish to rsvp queue
      await publish('rsvp', {
        method: 'sendMessage',
        guildId,
        channelId,
        content
      }, { durable: false, exclusive: true });
      log.info('Published RSVP message', { guildId, channelId, content });
    }, { durable: true, exclusive: false });

    setupShutdownHandlers();
  } catch (error) {
    log.error('Failed to initialize:', error);
    process.exit(1);
  }
})();
