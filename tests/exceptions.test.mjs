import { jest } from '@jest/globals';
import { registerExceptionHandlers } from '../src/exceptions.mjs';

describe('registerExceptionHandlers', () => {
  let processObj;
  let logger;
  beforeEach(() => {
    processObj = {
      on: jest.fn(),
      off: jest.fn()
    };
    logger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };
  });

  it('registers all handlers', () => {
    const { removeHandlers } = registerExceptionHandlers(processObj, logger);
    expect(processObj.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processObj.on).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    expect(processObj.on).toHaveBeenCalledWith('warning', expect.any(Function));
    expect(processObj.on).toHaveBeenCalledWith('exit', expect.any(Function));
    expect(typeof removeHandlers).toBe('function');
  });

  it('removeHandlers removes all handlers', () => {
    const { removeHandlers } = registerExceptionHandlers(processObj, logger);
    removeHandlers();
    expect(processObj.off).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processObj.off).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    expect(processObj.off).toHaveBeenCalledWith('warning', expect.any(Function));
    expect(processObj.off).toHaveBeenCalledWith('exit', expect.any(Function));
  });
});
