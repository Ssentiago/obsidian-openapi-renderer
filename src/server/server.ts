import express from 'express';
import {IncomingMessage, Server, ServerResponse} from 'http';
import {OpenAPIPluginContext} from "../contextManager";
import {ChangeServerButtonStateEvent, ChangeServerStateEvent, OpenAPIRendererServerInterface, PowerOffEvent} from "../typing/interfaces";
import * as net from "node:net";
import path from 'path'
import {eventID, eventPublisher, SERVER_BUTTON_ID, Subject} from "../typing/constants";
import yaml from "js-yaml";
import fs from "node:fs";


/**
 * Represents an Express server instance configured for OpenAPI rendering.
 */
export default class OpenAPIRendererServer implements OpenAPIRendererServerInterface {
    app!: express.Application;
    server?: Server<typeof IncomingMessage, typeof ServerResponse>;
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.initialize()
    }

    initialize(): void {
        this.app = express();
        this.setupMiddlewares()
        this.appContext.plugin.observer.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        )

    }


    /**
     * Asynchronous method called when unloading the server class, typically in response to a PowerOffEvent.
     * Stops the server if it is running.
     * @param event - The PowerOffEvent object.
     */
    protected async onunload(event: PowerOffEvent): Promise<void> {
        this.server && await this.stop()
    }


    /**
     * Starts the server if it's not already listening.
     * @returns A promise that resolves to true if the server starts successfully, otherwise false.
     */
    async start(): Promise<boolean> {
        if (this.server?.listening) {
            return false;
        }

        try {
            const port = await this.findFreePort(this.appContext.plugin.settings.serverPort);

            return new Promise<boolean>((resolve, reject) => {
                const newServer =
                    this.app.listen(port, this.appContext.plugin.settings.serverHostName, async () => {
                        if (port !== this.appContext.plugin.settings.serverPort) {
                            await this.updatePortSettings(port);
                        }

                        this.server = newServer;

                        this.publishServerButtonsChangeStateEvent();
                        this.publishServerChangeStateEvent()

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

    /**
     * Publishes a server state change event when the server is either started or stopped.
     */
    private publishServerButtonsChangeStateEvent(): void {
        const event = {
            eventID: eventID.ServerChangeButtonState,
            timestamp: new Date(),
            publisher: eventPublisher.Plugin,
            subject: Subject.Button,
            emitter: this.appContext.app.workspace,
            data: {
                buttonID: SERVER_BUTTON_ID,
            }
        } as ChangeServerButtonStateEvent;
        this.appContext.plugin.publisher.publish(event)

    }

    publishServerChangeStateEvent(): void {
        const event = {
            eventID: eventID.ServerChangedState,
            timestamp: new Date(),
            publisher: eventPublisher.Plugin,
            subject: Subject.Plugin,
            emitter: this.appContext.app.workspace,
        } as ChangeServerStateEvent
        this.appContext.plugin.publisher.publish(event)
    }

    /**
     * Stops the server if it is currently running and listening.
     * @returns A promise that resolves to true if the server stops successfully, otherwise false.
     */
    async stop(): Promise<boolean> {
        if (this.server?.listening) {
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
                this.publishServerButtonsChangeStateEvent()
                this.publishServerChangeStateEvent()
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
     * @returns A promise that resolves to true if the server reloads successfully, otherwise false.
     */
    async reload(): Promise<boolean> {
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
    public isRunning(): boolean {
        return !!this.server?.listening;
    }

    /**
     * Finds a free port starting from the given port number.
     * @param startPort - The starting port number to check.
     * @returns A Promise that resolves with the first available port number found.
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
     * Checks if a given port is available for listening.
     * @param port - The port number to check.
     * @returns A promise that resolves to true if the port is available, otherwise false.
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
     * Updates the server port setting with a new port number.
     * Saves the updated settings and notifies the user with a notice.
     * @param newPort - The new port number to set.
     */
    private async updatePortSettings(newPort: number): Promise<void> {
        const oldPort = this.appContext.plugin.settings.serverPort;
        this.appContext.plugin.settings.serverPort = newPort;
        await this.appContext.plugin.settingsManager.saveSettings();
        this.appContext.plugin.showNotice(`The originally configured port ${oldPort} was occupied. A new port ${newPort} has been assigned and saved in the settings.`)
    };

    /**
     * Validates a URL by decoding and normalizing it, and checking if the corresponding file exists.
     * @param url The URL to validate.
     * @returns A promise that resolves to true if the URL points to an existing HTML file, otherwise false.
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
            return ['.html', '.js', '.css', '.yaml', '.yml', '.json'].contains(ext)
        } catch (err: any) {
            this.appContext.plugin.logger.debug('Error in validateUrl:', err.message);
            return false;
        }
    }

    /**
     * Sets up middleware functions for the Express application.
     * Includes URL validation middleware, serving static files from the vault,
     * and handling undefined routes with a 404 response.
     */
    private setupMiddlewares(): void {
        const vaultPath = this.appContext.app.vault.getRoot().vault.adapter

        this.app.use(async (req, res, next) => {
            const url = req.path;

            try {
                const isValid = await this.validateUrl(url);
                if (isValid) {
                    next();
                } else {
                    res.status(404).send('Not found');
                }
            } catch (error: any) {
                this.appContext.plugin.logger.debug('Middleware error:', error.message);
                res.status(500).send('Internal Server Error');
            }
        });

        this.app.use(async (req, res, next) => {
            const url = req.path;

            try {
                const filePath = path.join(vaultPath.basePath, url);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const fileExt = path.extname(filePath).toLowerCase();

                if (['.yaml', '.yml', '.json'].includes(fileExt)) {
                    let jsonContent;
                    if (fileExt === '.json') {
                        jsonContent = JSON.parse(fileContent);
                    } else {
                        jsonContent = yaml.load(fileContent);
                    }

                    res.json(jsonContent);
                    return;
                }
                next();

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
     * Retrieves the server address in the format "address:port".
     * Returns `undefined` if the server address cannot be determined.
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
