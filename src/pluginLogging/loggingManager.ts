import * as fs from 'fs'
import * as path from "path";
import {OpenAPIPluginContext} from "../contextManager";
import {OpenAPIRendererPluginLoggerInterface} from "../typing/interfaces";

export default class OpenAPIRendererPluginLogger implements OpenAPIRendererPluginLoggerInterface {
    appContext;
    private maxFileSize = 1024 * 1024; // Maximum log file size in bytes (1 MB)
    private readonly logDir ;


    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.logDir = path.join(this.appContext.app.vault.adapter.basePath, '.obsidian/plugins/openapi-renderer/logs');
        this.ensureLogDirExists()
    }

    private ensureLogDirExists() {
        fs.access(this.logDir, fs.constants.F_OK, (err) => {
            if (err) {
                fs.mkdir(this.logDir, {recursive: true}, (err) => {
                    if (err) {
                        console.error('Error creating log directory:', err);
                    }
                });
            }
        });
    }

    /**
     * Rotates the log file by creating a new file with a timestamped name and moving the existing log file to it.
     * This function is used to manage the size of the log file and prevent it from growing indefinitely.
     *
     * @returns void
     */
    private getLogFilePath() {
        return path.join(this.logDir, 'logs.txt');
    }

    private rotateLogs() {
        const logPath = this.getLogFilePath();
        const rotatedLogPath = path.join(this.logDir, `logs_${Date.now()}.txt`);

        fs.rename(logPath, rotatedLogPath, (err) => {
            if (err) {
                console.error('Error rotating log file:', err);
            }
        });
    }


    /**
     * Writes a log entry to the log file.
     *
     * @param level - The severity level of the log entry.
     * @param message - The message to be logged.
     * @param context - Additional contextual information for the log entry.
     */
    private log(level: string, message: string, context = {}) {

        const logEntry = {
            timestamp: new Date().toLocaleString("ru"),
            level: level,
            message: message,
            context: {...context}
        };

        const logMessage = JSON.stringify(logEntry) + '\n';
        const logPath = this.getLogFilePath();

        fs.access(logPath, fs.constants.F_OK, (err) => {
            if (err) {
                // The file does not exist, create a new log file
                fs.writeFile(logPath, logMessage, (err) => {
                    if (err) {
                        console.error('Error writing to log file:', err);
                    }
                });
            } else {
                // The file exists, check the size and add an entry
                fs.stat(logPath, (err, stats) => {
                    if (err) {
                        console.error('Error checking log file size:', err);
                    } else if (stats.size >= this.maxFileSize) {
                        // File exceeds size, perform rotation
                        this.rotateLogs();
                        fs.writeFile(logPath, logMessage, (err) => {
                            if (err) {
                                console.error('Error writing to new log file:', err);
                            }
                        });
                    } else {
                        // Write to the current log file
                        fs.appendFile(logPath, logMessage, (err) => {
                            if (err) {
                                console.error('Error writing to log file:', err);
                            }
                        });
                    }
                });
            }
        });
    }

    info(message: string, context = {}) {
        this.log('INFO', message, context);
    }

    error(message: string, context = {}) {
        this.log('ERROR', message, context);
    }

    warn(message: string, context = {}) {
        this.log('WARNING', message, context);
    }

    debug(message: string, context = {}) {
        this.log('DEBUG', message, context);
    }

}
