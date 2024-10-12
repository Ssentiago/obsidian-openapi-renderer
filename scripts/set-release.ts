import { execSync } from 'node:child_process';
import fs from 'node:fs';
import * as process from 'node:process';
import readline from 'node:readline';

interface JsonFile {
    version: string;
}

/**
 * Reads a JSON file, updates its "version" property, and writes it back.
 *
 * @param jsonPath - Path to the JSON file to be updated.
 * @param release - New version number to be written.
 *
 * @throws If there is an error reading the JSON file, it will be logged to console
 *          and the process will exit with code 1.
 */
function changeReleaseInJson(jsonPath: string, release: string) {
    try {
        const json = fs.readFileSync(jsonPath, 'utf8');
        const data: JsonFile = JSON.parse(json);
        data.version = release;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    } catch (err: any) {
        console.error('Error reading JSON file:', err);
        process.exit(1);
    }
}

/**
 * Checks whether a given string is a valid semantic version number.
 *
 * A valid version number must consist of three numbers, separated by periods,
 * like "1.2.3". The numbers must not be negative.
 *
 * @param version - The string to be checked.
 *
 * @returns `true` if the version string is valid, `false` otherwise.
 */
function checkIsValidVersion(version: string) {
    const regex = /^\d+\.\d+\.\d+$/;
    return regex.test(version);
}

/**
 * Asks the user a yes/no question and returns a promise that resolves to true
 * if the user answers with "y" or "yes", and false otherwise.
 *
 * @param question The question to ask the user.
 * @returns A promise that resolves to true if the user answers "y" or "yes", and
 *          false otherwise.
 */
function askForConfirmation(question: string) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question + ' (y/n): ', (answer) => {
            rl.close();
            resolve(['y', 'yes'].includes(answer.toLowerCase()));
        });
    });
}

/**
 * Updates the plugin version and performs related git operations.
 *
 * @throws If the provided version is not a valid semantic version number, the
 *          process will exit with code 1.
 *
 * @param {string} RELEASE_VERSION - New version number to be written.
 *
 * @example
 * yarn set-release 1.2.3
 */
async function setRelease() {
    const args = process.argv;
    if (args.length !== 3) {
        console.error('Usage: yarn set-release <version>');
        process.exit(1);
    }

    const RELEASE_VERSION = args[2];
    if (!checkIsValidVersion(RELEASE_VERSION)) {
        console.error(
            'Error: Invalid version format. Use semantic versioning (e.g., 1.2.3)'
        );
        process.exit(1);
    }

    changeReleaseInJson('package.json', RELEASE_VERSION);
    changeReleaseInJson('manifest.json', RELEASE_VERSION);

    console.log(
        `Version updated to ${RELEASE_VERSION} in package.json and manifest.json`
    );

    const confirmedContinue = await askForConfirmation(
        'Do you want to continue with git operations?'
    );

    if (!confirmedContinue) {
        console.log('See you later!');
        process.exit(1);
    }

    console.log('Committing changes...');

    try {
        execSync('git reset', { stdio: 'inherit' });
        execSync('git add package.json manifest.json', { stdio: 'inherit' });
        execSync(`git commit -m 'chore: update plugin version'`, {
            stdio: 'inherit',
        });
        execSync('git push', { stdio: 'inherit' });
        execSync(`git tag ${RELEASE_VERSION}`, { stdio: 'inherit' });
        execSync(`git push origin main ${RELEASE_VERSION}`, {
            stdio: 'inherit',
        });

        console.log('Release process completed successfully!');
    } catch (error) {
        console.error('An error occurred during git operations:', error);
        process.exit(1);
    }
    console.log(
        `Release ${RELEASE_VERSION} has been successfully created and pushed.`
    );
}

setRelease().catch((error) => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});
