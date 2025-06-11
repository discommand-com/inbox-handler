import log from './log.mjs';

/**
 * Sets up shutdown handlers for the process.
 * @param {Object} options
 * @param {Object} [options.processObj=process] - The process object to attach handlers to.
 * @param {Object} [options.logger=log] - Logger for output.
 * @param {string[]} [options.signals=['SIGTERM', 'SIGINT', 'SIGHUP']] - Signals to listen for.
 * @returns {Object} { shutdown, getShuttingDown }
 */
export const setupShutdownHandlers = ({
    processObj = process,
    logger = log,
    signals = ['SIGTERM', 'SIGINT', 'SIGHUP']
} = {}) => {
    let shuttingDown = false;
    const getShuttingDown = () => shuttingDown;
    const shutdown = async (signal) => {
        if (shuttingDown) {
            logger.warn(`Received ${signal} again, but already shutting down.`);
            return;
        }
        shuttingDown = true;
        logger.info(`Received ${signal}. Shutting down gracefully...`);
        if (global.httpInstance && typeof global.httpInstance.close === 'function') {
            try {
                await new Promise((resolve, reject) => {
                    global.httpInstance.close((err) => {
                        if (err) reject(err); else resolve();
                    });
                });
                logger.info('HTTP server stopped.');
            } catch (err) {
                logger.error('Error stopping HTTP server:', err);
            }
        }
        if (global.mcpServer && typeof global.mcpServer.close === 'function') {
            try {
                await global.mcpServer.close();
                logger.info('MCP server stopped.');
            } catch (err) {
                logger.error('Error stopping MCP server:', err);
            }
        }
        processObj.exit(0);
    };
    signals.forEach(signal => {
        processObj.on(signal, () => shutdown(signal));
    });
    return { shutdown, getShuttingDown };
};