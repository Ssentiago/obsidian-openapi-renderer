import { execSync } from 'node:child_process';
import fs from 'node:fs';
import * as process from 'node:process';
import readline from 'node:readline';
import { async } from 'rxjs';
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

async function waitForKeyPress(rl: readline.Interface): Promise<void> {
    return new Promise((resolve) => {
        rl.on('line', () => {
            resolve();
        });
    });
}

async function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
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
async function askForVersion(
    previousVersions: string[],
    currentVersion: string
) {
    while (true) {
        const answer = await askQuestion(
            'Enter new version number or type exit to quit: '
        ).then((answer) => answer.toLowerCase());

        if (answer === 'exit') {
            console.log('See you later!');
            process.exit(0);
        }

        if (!semver.valid(answer)) {
            console.log(
                'Invalid version format. Please try again. It should be semantic versioning (e.g., 1.2.3)\n'
            );
            continue;
        }

        if (previousVersions.includes(answer)) {
            console.log('Version already exists. Please try again.\n');
            continue;
        }

        if (semver.lt(answer, currentVersion)) {
            console.log(
                `Version must be greater than current version. Current version is: ${currentVersion}. Please try again.\n`
            );
            continue;
        }
        return answer;
    }
}

async function versionMenu(previousVersions: string[], currentVersion: string) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    console.log(
        `Update current version ${currentVersion} or perform other actions:`
    );
    console.log('1. Patch (bug fixes)');
    console.log('   Example: x.x.x → x.x.y (increment last number)');
    console.log('2. Minor (new functionality)');
    console.log('   Example: x.x.x → x.y.0 (increment middle number)');
    console.log('3. Major (significant changes)');
    console.log('   Example: x.x.x → y.0.0 (increment first number)');
    console.log('4. Manual update (enter version)');
    console.log('5. View previous versions');
    console.log('6. Exit');

    const choice = await askQuestion('Your choice (1-6): ');

    switch (choice) {
        case '1':
            return `${major}.${minor}.${patch + 1}`;
        case '2':
            return `${major}.${minor + 1}.0`;
        case '3':
            return `${major + 1}.0.0`;
        case '4':
            return askForVersion(previousVersions, currentVersion);
        case '5':
            console.log('Previous versions:');
            for (const version of previousVersions) {
                console.log(`- ${version}`);
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            console.log('Press Enter to go back to the menu...');
            await waitForKeyPress(rl);
            rl.close();

            return versionMenu(previousVersions, currentVersion);
        case '6':
            console.log('See you later!');
            process.exit(0);
        default:
            console.log('Invalid choice. Please try again.');
            return versionMenu(previousVersions, currentVersion);
    }
}

/**
 * Shows the list of existing tags and asks the user to enter a new version number.
 * @returns A promise that resolves with the new version number.
 */
async function getVersion(): Promise<string> {
    const tags = execSync('git tag', { stdio: 'pipe' })
        .toString()
        .trim()
        .split('\n');

    const currentVersion = tags[tags.length - 1];

    if (tags.length === 0) {
        return askForVersion(tags, currentVersion);
    }

    return versionMenu(tags, currentVersion);
}

async function setRelease() {
    const RELEASE_VERSION = await getVersion();

    const confirmedContinue = await askQuestion(
        `You entered version ${RELEASE_VERSION}. Continue? Yes/No/Retry (y/n/r): `
    ).then((answer) => answer.toLowerCase());

    switch (confirmedContinue) {
        case 'yes':
        case 'y':
            break;
        case 'no':
        case 'n':
            console.log('See you later!');
            process.exit(0);
        case 'retry':
        case 'r':
            return setRelease();
        default:
            console.log('Invalid choice. Please try again.');
            return setRelease();
    }

    changeReleaseInJson(PACKAGE_PATH, RELEASE_VERSION);
    changeReleaseInJson(MANIFEST_PATH, RELEASE_VERSION);

    console.log(
        `Version updated to ${RELEASE_VERSION} in package.json and manifest.json`
    );

    const confirmContinue = await askQuestion(
        'Do you want to continue with git operations?'
    );

    if (!(confirmContinue === 'yes' || confirmContinue === 'y')) {
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
