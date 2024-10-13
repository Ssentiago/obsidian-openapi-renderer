import { spawn } from 'child_process';
import { promises as fs } from 'node:fs';
import * as process from 'node:process';
import psList from 'ps-list';

const OBSIDIAN_PATH = process.env.OBSIDIAN_PATH;

if (!OBSIDIAN_PATH) {
    console.error('OBSIDIAN_PATH is not set in the environment variables.');
    process.exit(1);
}

/**
 * Checks if Obsidian is currently running.
 *
 * @returns A promise that resolves to `true` if Obsidian is running, `false` otherwise.
 */
async function isObsidianRunning() {
    const processes = await psList();
    return processes.some((p) => p.name.toLowerCase().includes('obsidian'));
}

/**
 * Starts Obsidian in debugging mode at port 9222.
 *
 * @param obsidianPath - The path to the Obsidian executable.
 *
 * @returns A promise that resolves when Obsidian has been started.
 */
async function startObsidian(obsidianPath: string) {
    const isRunning = await isObsidianRunning();
    if (isRunning) {
        console.log('Obsidian is already running.');
        return;
    }

    try {
        await fs.access(obsidianPath, fs.constants.F_OK);
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            console.error('Obsidian not found at path:', obsidianPath);
            process.exit(1);
        } else {
            throw err;
        }
    }

    const cp = spawn(obsidianPath, ['--remote-debugging-port=9222'], {
        detached: true,
        stdio: 'ignore',
    });
    cp.unref();
    console.log('Obsidian started in debugging mode at port 9222.');
}

if (!OBSIDIAN_PATH) {
    console.error('OBSIDIAN_PATH is not set in the environment variables.');
    process.exit(1);
}

startObsidian(OBSIDIAN_PATH).catch((err) => {
    console.error('Error starting Obsidian:', err);
    process.exit(1);
});
