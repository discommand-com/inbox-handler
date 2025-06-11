// Tests for shutdown.mjs
import { setupShutdownHandlers } from '../src/shutdown.mjs';
import { jest } from '@jest/globals';

describe('setupShutdownHandlers', () => {
  let processObj;
  let logger;
  let httpInstance;
  let mcpServer;

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
    httpInstance = { close: jest.fn(cb => cb && cb()) };
    mcpServer = { close: jest.fn().mockResolvedValue() };
    global.httpInstance = httpInstance;
    global.mcpServer = mcpServer;
  });

  afterEach(() => {
    delete global.httpInstance;
    delete global.mcpServer;
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
    expect(httpInstance.close).toHaveBeenCalled();
    expect(mcpServer.close).toHaveBeenCalled();
    expect(processObj.exit).toHaveBeenCalledWith(0);
  });

  it('warns if shutdown called twice', async () => {
    const { shutdown } = setupShutdownHandlers({ processObj, logger });
    await shutdown('SIGINT');
    await shutdown('SIGINT');
    expect(logger.warn).toHaveBeenCalledWith('Received SIGINT again, but already shutting down.');
  });

  it('handles httpInstance.close error', async () => {
    httpInstance.close = jest.fn(cb => cb && cb(new Error('fail')));
    const { shutdown } = setupShutdownHandlers({ processObj, logger });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error stopping HTTP server:', expect.any(Error));
  });

  it('handles mcpServer.close error', async () => {
    mcpServer.close = jest.fn().mockRejectedValue(new Error('fail'));
    const { shutdown } = setupShutdownHandlers({ processObj, logger });
    await shutdown('SIGTERM');
    expect(logger.error).toHaveBeenCalledWith('Error stopping MCP server:', expect.any(Error));
  });

  it('getShuttingDown returns correct state', async () => {
    const { shutdown, getShuttingDown } = setupShutdownHandlers({ processObj, logger });
    expect(getShuttingDown()).toBe(false);
    await shutdown('SIGTERM');
    expect(getShuttingDown()).toBe(true);
  });
});
