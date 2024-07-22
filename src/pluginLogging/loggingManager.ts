import * as path from 'path';
import * as fs from 'fs';
import { OpenAPIPluginContext } from "../contextManager";
import { OpenAPIRendererPluginLoggerInterface } from "../typing/interfaces";
import * as SimpleNodeLogger from 'simple-node-logger';

export default class OpenAPIRendererPluginLogger implements OpenAPIRendererPluginLoggerInterface {
    private readonly logger: SimpleNodeLogger.Logger;
    private readonly logDir: string;
    private readonly maxFileSize: number = 1024 * 1024 * 10;
    private readonly maxLogFiles: number = 7;

    constructor(appContext: OpenAPIPluginContext) {
        const pluginDir = appContext.plugin.manifest.dir;
        if (pluginDir) {
            this.logDir = path.join(appContext.app.vault.adapter.basePath, pluginDir, 'logs');
            this.ensureLogDirExists();

            const logFilePath = path.join(this.logDir, 'logs.log');
            const options = {
                logFilePath,
                maxLogSize: this.maxFileSize,
                maxLogFiles: this.maxLogFiles,
            };

            this.logger = SimpleNodeLogger.createSimpleLogger(options);

            this.setupRotation(logFilePath);
        } else {
            throw new Error('Plugin directory is not defined');
        }
    }

    private ensureLogDirExists() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private setupRotation(filePath: string) {
        fs.watchFile(filePath, { interval: 10000 }, () => {
            this.checkLogSize(filePath);
        });
    }

    private checkLogSize(filePath: string) {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                this.logger.error('Error checking log file size', err);
            } else if (stats.size >= this.maxFileSize) {
                this.rotateLogs(filePath);
            }
        });
    }

    private rotateLogs(filePath: string) {
        const rotatedLogPath = path.join(this.logDir, `logs_${Date.now()}.log`);
        fs.rename(filePath, rotatedLogPath, (err) => {
            if (err) {
                this.logger.error('Error rotating log file', err);
            }
        });
    }

    info(message: string, context: object = {}) {
        this.logger.info(message, context);
    }

    error(message: string, context: object = {}) {
        this.logger.error(message, context);
    }

    warn(message: string, context: object = {}) {
        this.logger.warn(message, context);
    }

    debug(message: string, context: object = {}) {
        this.logger.debug(message, context);
    }
}
