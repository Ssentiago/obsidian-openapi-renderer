import {Octokit} from "@octokit/rest";
import {OpenAPIPluginContext} from "../core/contextManager";
import path from "path";
import fs from 'fs';
import {pipeline} from 'stream/promises';
import {createGunzip} from 'zlib';
import https from 'https';
import * as tar from 'tar';

export class GithubClient {
    private octokit: Octokit;
    private owner: string = 'Ssentiago';
    private repo: string = 'openapi-renderer';
    private tag: string;
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.octokit = new Octokit();
        this.tag = this.appContext.plugin.manifest.version;
    }

    async getArtefactFromLatestRelease(name: string) {
        try {
            const {data: release} = await this.octokit.repos.getReleaseByTag({
                owner: this.owner,
                repo: this.repo,
                tag: this.tag,
            });

            return release.assets
                .filter(asset => asset.name === name)
                .map(asset => ({
                    name: asset.name,
                    download_url: asset.browser_download_url,
                }));
        } catch (error) {
            console.error(`Error fetching release for tag ${this.tag}:`, error);
            throw error;
        }
    }

    async downloadAssetsFromLatestRelease() {
        const pluginPath = this.appContext.plugin.manifest.dir;
        const basePath = this.appContext.app.vault.getRoot().vault.adapter.basePath;
        if (pluginPath) {
            const relativeAssetsPath = path.join(pluginPath, 'assets');
            const fullAssetsPath = path.join(basePath, relativeAssetsPath);
            const archivePath = path.join(basePath, pluginPath, 'assets.tar.gz');
            await this.appContext.app.vault.adapter.mkdir(relativeAssetsPath);

            try {
                const artefact = await this.getArtefactFromLatestRelease('assets.tar.gz');
                if (artefact.length === 0) {
                    throw new Error('Asset not found in release');
                }
                const asset = artefact[0];

                await this.downloadFile(asset.download_url, archivePath);

                await this.extractArchive(archivePath, fullAssetsPath);
                fs.unlinkSync(archivePath);
                this.appContext.plugin.showNotice('Plugin assets downloaded and extracted successfully.');
            } catch (err: any) {
                this.appContext.plugin.showNotice('Failed to download or extract plugin assets. Check logs');
                this.appContext.plugin.logger.error(err.message)
                throw err;
            }
        }
    }

    private downloadFile(url: string, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            https.get(url, {headers: {'User-Agent': 'Node.js'}}, (response) => {
                if (response.statusCode === 302) {
                    const redirectUrl = response.headers.location;
                    if (typeof redirectUrl === 'string') {
                        this.downloadFile(redirectUrl, filePath)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error('Redirect location is missing or invalid'));
                    }
                    return;
                }
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                    return;
                }
                const fileStream = fs.createWriteStream(filePath);
                pipeline(response, fileStream)
                    .then(() => resolve())
                    .catch(reject);
            }).on('error', reject);
        });
    }

    private async extractArchive(archivePath: string, extractPath: string) {
        return new Promise<void>((resolve, reject) => {
            const extract = tar.extract({cwd: extractPath, strip: 1}); // Use strip to remove leading folder structure

            const fileStream = fs.createReadStream(archivePath);
            const gunzip = createGunzip();

            fileStream.pipe(gunzip).pipe(extract)
                .on('error', (err) => {
                    // If gunzip fails, try without it (might be a plain tar)
                    fileStream.unpipe(gunzip);
                    fileStream.pipe(extract)
                        .on('error', (tarErr) => {
                            console.error('Tar extraction error:', tarErr);
                            reject(tarErr);
                        })
                        .on('finish', () => {
                            resolve();
                        });
                })
                .on('finish', () => {
                    resolve();
                });
        });
    }
}