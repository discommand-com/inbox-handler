// Tests for shutdown.mjs
import { setupShutdownHandlers } from '../src/shutdown.mjs';
import { jest } from '@jest/globals';

describe('setupShutdownHandlers', () => {
  let processObj;
  let logger;

  beforeEach(() => {
    processObj = {
      on: jest.fn(),
      exit: jest.fn()
    };
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  it('registers signal handlers', () => {
    setupShutdownHandlers({ processObj, logger, signals: ['SIGTERM', 'SIGINT'] });
    expect(processObj.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(processObj.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  it('shuts down gracefully on signal', async () => {
    const { shutdown } = setupShutdownHandlers({ processObj, logger });
    await shutdown('SIGTERM');
    expect(logger.info).toHaveBeenCalledWith('Received SIGTERM. Shutting down gracefully...');
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });

  it('warns if shutdown called twice', async () => {
    const { shutdown } = setupShutdownHandlers({ processObj, logger });
    await shutdown('SIGINT');
    await shutdown('SIGINT');
    expect(logger.warn).toHaveBeenCalledWith('Received SIGINT again, but already shutting down.');
  });

  it('getShuttingDown returns correct state', async () => {
    const { shutdown, getShuttingDown } = setupShutdownHandlers({ processObj, logger });
    expect(getShuttingDown()).toBe(false);
    await shutdown('SIGTERM');
    expect(getShuttingDown()).toBe(true);
  });
});
