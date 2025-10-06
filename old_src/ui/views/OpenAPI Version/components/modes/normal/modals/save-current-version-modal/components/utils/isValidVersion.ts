export function isValidVersion(
    newVersion: string,
    previousVersion: string
): boolean {
    const parseVersion = (version: string): number[] =>
        version.split('.').map(Number);

    const [newMajor, newMinor, newPatch] = parseVersion(newVersion);
    const [prevMajor, prevMinor, prevPatch] = parseVersion(previousVersion);

    return (
        newMajor > prevMajor ||
        (newMajor === prevMajor && newMinor > prevMinor) ||
        (newMajor === prevMajor &&
            newMinor === prevMinor &&
            newPatch > prevPatch)
    );
}
