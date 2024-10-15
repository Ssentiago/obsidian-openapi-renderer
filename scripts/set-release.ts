import { execSync } from 'node:child_process';
import fs from 'node:fs';
import * as process from 'node:process';
import readline from 'node:readline';
import semver from 'semver';

const MANIFEST_PATH = 'manifest.json';
const PACKAGE_PATH = 'package.json';

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
 * Performs all the necessary git commands to publish a new release.
 *
 * Runs the following commands in order:
 *
 * 1. `git reset`
 * 2. `git add package.json manifest.json`
 * 3. `git commit -m "chore: update plugin version"`
 * 4. `git push`
 * 5. `git tag <RELEASE_VERSION>`
 * 6. `git push origin main <RELEASE_VERSION>`
 *
 * If any of the commands fail, the process will exit with code 1.
 *
 * @param RELEASE_VERSION The version number to be released.
 */
function performGitCommands(RELEASE_VERSION: string) {
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
}

/**
 * Asks the user to enter a new version number.
 *
 * The entered version will be validated against the following rules:
 * 1. It should be a valid semantic versioning string (e.g., 1.2.3).
 * 2. It should not already exist in the list of previous versions.
 * 3. It should be greater than the previous version.
 *
 * If the user enters an invalid version, or a version that already exists,
 * or a version that is not greater than the previous version, the user will
 * be prompted to try again.
 *
 * @param previousVersions - List of previous versions.
 * @returns A promise that resolves to the new version number entered by the
 *          user.
 */
function askForVersion(previousVersions: string[]): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const promtUser = () => {
            rl.question(
                'Enter new version number or type exit to quit: ',
                (answer) => {
                    if (answer.toLowerCase() === 'exit') {
                        console.log('See you later!');
                        rl.close();
                        process.exit(0);
                    }
                    if (!semver.valid(answer)) {
                        console.log(
                            'Invalid version format. Please try again. It should be semantic versioning (e.g., 1.2.3)\n'
                        );
                        return promtUser();
                    }

                    if (previousVersions.includes(answer)) {
                        console.log(
                            'Version already exists. Please try again.\n'
                        );
                        return promtUser();
                    }
                    for (const version of previousVersions) {
                        if (semver.lt(answer, version)) {
                            console.log(
                                `New version should be greater than previous version. Previous version is: ${previousVersions[previousVersions.length - 1]}. Please try again.\n`
                            );
                            return promtUser();
                        }
                    }

                    rl.close();
                    resolve(answer);
                }
            );
        };
        promtUser();
    });
}

/**
 * Shows the list of existing tags and asks the user to enter a new version number.
 * @returns A promise that resolves with the new version number.
 */
async function tagStats(): Promise<string> {
    const tags = execSync('git tag', { stdio: 'pipe' })
        .toString()
        .trim()
        .split('\n');

    console.log('Your versions list:', tags);
    console.log(`Last version is: ${tags[tags.length - 1]}\n`);
    return askForVersion(tags);
}

/**
 * Updates the version number in package.json and manifest.json and asks the user
 * whether to continue with git operations (commit, tag, push).
 *
 * The function asks the user to enter a new version number and performs checks on it
 *
 * If the user confirms to continue, the function commits the changes, tags the
 * new version, and pushes the changes to the repository.
 *
 * @returns {Promise<void>} - A promise that resolves when all operations are completed.
 */
async function setRelease() {
    const RELEASE_VERSION = await tagStats();

    changeReleaseInJson(PACKAGE_PATH, RELEASE_VERSION);
    changeReleaseInJson(MANIFEST_PATH, RELEASE_VERSION);

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

    performGitCommands(RELEASE_VERSION);

    console.log(
        `Release ${RELEASE_VERSION} has been successfully created and pushed.`
    );
}

setRelease().catch((error) => {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
});
