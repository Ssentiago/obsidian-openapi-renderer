import express from 'express';
import {IncomingMessage, Server, ServerResponse} from 'http';
import {OpenAPIPluginContext} from "../contextManager";
import {
    ChangeServerButtonStateEvent,
    OpenAPIRendererServerInterface,
    PowerOffEvent,
    ToggleButtonVisibilityEvent
} from "../typing/interfaces";
import * as net from "node:net";
import path from 'path'
import {eventID, eventPublisher, SERVER_BUTTON_ID, Subject} from "../typing/types";


/**
 * The `OpenAPIRendererServer` class manages an Express server instance.
 * It provides methods to start, stop, and reload the server, along with various utilities
 * to handle port management and request validation.
 */
export default class OpenAPIRendererServer implements OpenAPIRendererServerInterface {
    app!: express.Application;
    server?: Server<typeof IncomingMessage, typeof ServerResponse>;
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.app = express();
        this.setupMiddlewares()
        this.appContext.plugin.observer.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        )
    }

    async onunload(event: PowerOffEvent) {
        console.log('got onunload in server class')
        this.server && await this.stop()
    }


    /**
     * Starts the server if it is not already listening.
     *
     * @returns A promise that resolves to `true` if the server was started successfully,
     * or `false` if the server was already running.
     * @throws Will log an error and return `false` if the server fails to start.
     */
    async start(): Promise<boolean> {
        if (this.server?.listening) {
            return false;
        }

        try {
            const port = await this.findFreePort(this.appContext.plugin.settings.serverPort);

            return new Promise<boolean>((resolve, reject) => {
                const newServer =
                    this.app.listen(port, this.appContext.plugin.settings.serverHostName, () => {
                    if (port !== this.appContext.plugin.settings.serverPort) {
                        this.updatePortSettings(port);
                    }

                    this.server = newServer;

                    this.publishServerStartEvent();

                    resolve(true);
                });

                newServer.on('error', (error) => {
                    this.appContext.plugin.logger.error(`Failed to start the server: ${error}`);
                    reject(error);
                });
            });
        } catch (err) {
            this.appContext.plugin.logger.error(`Error during server start: ${err}`);
            return false;
        }
    }
    publishServerStartEvent() {
        const event = {
            eventID: eventID.ServerStarted,
            timestamp: new Date(),
            publisher: eventPublisher.Settings,
            subject: Subject.Button,
            emitter: this.appContext.app.workspace,
            data: {
                buttonID: SERVER_BUTTON_ID,
            }
        } as ChangeServerButtonStateEvent;
        this.appContext.plugin.publisher.publish(event)
    }

    // async stop(): Promise<boolean> {
    //         try {
    //             if (this.server && this.server.listening) {
    //                 await new Promise<void>((resolve, reject) => {
    //                     this.server?.close((err: any) => {
    //                         if (err) {
    //                             this.appContext.plugin.logger.error(err);
    //                             reject(err);
    //                         } else {
    //                             resolve();
    //                         }
    //                     });
    //                 });
    //                 return true; // Return true if the server was stopped successfully
    //             } else {
    //                 return false; // Return false if the server has not already been started or is not in listening state
    //             }
    //         } catch (err) {
    //             const msg = Failed to stop the server: ${err}
    //             this.appContext.plugin.logger.debug('Failed to stop the server. Check the log file for more information.');
    //             this.appContext.plugin.showNotice(msg)
    //             return false; // Return false if an error occurs when stopping the server
    //         }
    //     }

    /**
     * Asynchronously stops the server.
     *
     * @returns A promise that resolves to true if the server is successfully stopped, otherwise false.
     */
    async stop(): Promise<boolean> {
        if (this.server && this.server.listening) {
            await new Promise<void>((resolve, reject) => {
                this.server?.close((err: any) => {
                    if (err) {
                        this.appContext.plugin.logger.error(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }).then(() => {
                return true
            }).catch((err: Error) => {
                this.appContext.plugin.logger.debug(`Failed to stop the server: ${err.message}`);
                this.appContext.plugin.showNotice('Failed to stop the server. Check the log file for more information.')
                return false;
            });
            return true
        }
        return false
    }

    /**
     * Reloads the server by stopping it and then starting it again.
     *
     * @returns  A promise that resolves to `true` if the server was reloaded successfully,
     * or `false` if an error occurred during the process.
     * @throws Will log an error message and return `false` if the server fails to reload.
     */
    async reload() {
        try {
            await this.stop();
            await this.start();
            return true
        } catch (err: any) {
            this.appContext.plugin.logger.debug(err.message)
            return false
        }

    }

    /**
     * Checks if the server is currently running.
     *
     * @returns true if the server is running and listening, false otherwise.
     */
    isRunning() {
        return this.server?.listening;
    }

    /**
     * Finds a free port starting from the given port.
     *
     * @param startPort - The port number to start checking from.
     * @returns  A promise that resolves to a free port number.
     * @throws Will log an error message and reject the promise if an error occurs while checking port availability.
     * @private
     */
    private findFreePort(startPort: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.isPortAvailable(startPort).then((available) => {
                if (available) {
                    resolve(startPort);
                } else {
                    this.findFreePort(startPort + 1).then(resolve, reject);
                }
            }).catch((error: Error) => {
                this.appContext.plugin.logger.error(error.message)
                reject(error)
            });
        });
    }

    /**
     * Checks if a specific port is available for use.
     *
     * @param  port - The port number to check.
     * @returns A promise that resolves to `true` if the port is available, or `false` if it is in use.
     * @throws Will reject the promise with an error if an unexpected error occurs.
     */
    isPortAvailable(port: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const server = net.createServer();
            server.unref();
            server.on('error', (err) => {
                const errorCode = (err as NodeJS.ErrnoException).code;

                if (errorCode === 'EADDRINUSE' || errorCode === 'EACCES') {
                    resolve(false);
                } else {
                    reject(err);
                }

            });
            server.listen(port, () => {
                server.close(() => {
                    resolve(true);
                });
            });
        });
    };

    /**
     * Updates the server port settings to a new port and saves the updated settings.
     * Also, displays a notice to the user about the port change.
     *
     * @param newPort - The new port number to be set.
     * @returns A promise that resolves when the settings have been saved.
     * @throws Will log and display a notice about the port change.
     * @private
     */
    private async updatePortSettings(newPort: number) {
        const oldPort = this.appContext.plugin.settings.serverPort;
        this.appContext.plugin.settings.serverPort = newPort;
        await this.appContext.plugin.saveSettings();
        this.appContext.plugin.showNotice(`The originally configured port ${oldPort} was occupied. A new port ${newPort} has been assigned and saved in the settings.`)
    };

    /**
     * Validates a URL by decoding, normalizing, and checking its existence in the vault adapter.
     *
     * @async
     * @param {string} url - The URL to validate.
     * @returns A promise that resolves to true if the URL exists and has a '.html' extension, false otherwise.
     */
    private async validateUrl(url: string): Promise<boolean> {
        try {
            const requestedUrl = decodeURIComponent(url);
            const normalizedUrl = path.normalize(requestedUrl);
            const isExist = await this.appContext.app.vault.adapter.exists(normalizedUrl);
            if (!isExist) {
                return false;
            }
            const ext = path.extname(normalizedUrl);
            return ext === '.html';
        } catch (err: any) {
            this.appContext.plugin.logger.debug('Error in validateUrl:', err.message);
            return false;
        }
    }

    /**
     * Sets up the middlewares for the server, including URL validation, static file serving,
     * and handling of undefined routes.
     *
     * @private
     */
    private setupMiddlewares() {
        const vaultPath = this.appContext.app.vault.getRoot().vault.adapter
        // URL validation middleware: it must end with .html
        this.app.use(async (req, res, next) => {
            const url = req.path;

            try {
                const isValid = await this.validateUrl(url);
                if (isValid) {
                    next();
                } else {
                    res.status(404).send('Не найдено');
                }
            } catch (error: any) {
                this.appContext.plugin.logger.debug('Middleware error:', error.message);
                res.status(500).send('Internal Server Error');
            }
        });

        // Serving static files
        this.app.use(express.static(vaultPath.basePath));

        // Process all undefined routes
        this.app.use((req, res) => {
            res.status(404).send('Not found');
        });
    }

    /**
     * Gets the server address.
     *
     * @returns The server address as a string, or `undefined` if the server is not running.
     * If the address is an object, it returns the address in the format "address:port".
     */
    get serverAddress(): string | undefined {
        const address = this.server?.address()
        if (typeof address === "string") {
            return address;
        } else if (address && typeof address === "object" && "port" in address) {
            return `${address.address}:${address.port}`;
        }
        return undefined;
    }
}
