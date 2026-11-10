import type { Diagnostic } from '@codemirror/lint';

type IssueSeverity = 'error' | 'warning';

interface Range {
    from: number;
    to: number;
}

interface SpecIssue {
    message: string;
    severity: IssueSeverity;
    /**
     * Resolves the highlight range in the source text. When omitted or when
     * nothing matches, the issue anchors to the first line of the document.
     */
    locate?: (text: string) => Range | null;
}

const HTTP_METHODS = [
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
];

const PATH_LEVEL_FIELDS = [
    'summary',
    'description',
    'servers',
    'parameters',
    '$ref',
];

function isMapping(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Matches a block mapping key line for the given key. The key may optionally
 * be quoted; the lookahead requires a colon so key prefixes of longer keys
 * (get inside getter) never match.
 */
function keyRegExp(key: string): RegExp {
    return new RegExp(
        `(^|\\n)([ \\t]*)(["']?)${escapeRegExp(key)}\\3(?=\\s*:)`,
        'm'
    );
}

function nthExec(
    pattern: RegExp,
    text: string,
    occurrence: number
): RegExpExecArray | null {
    const flags = pattern.flags.includes('g')
        ? pattern.flags
        : `${pattern.flags}g`;
    const global = new RegExp(pattern.source, flags);
    let match: RegExpExecArray | null = null;
    for (let index = 0; index < occurrence; index += 1) {
        match = global.exec(text);
        if (match === null) {
            return null;
        }
        if (match[0].length === 0) {
            global.lastIndex += 1;
        }
    }
    return match;
}

function keyMatchRange(match: RegExpExecArray): Range {
    const from = match.index + match[1].length + match[2].length;
    return {
        from,
        to: from + (match[0].length - match[1].length - match[2].length),
    };
}

function keyLocator(key: string, occurrence = 1) {
    return (text: string): Range | null => {
        const match = nthExec(keyRegExp(key), text, occurrence);
        return match ? keyMatchRange(match) : null;
    };
}

/**
 * Anchors a nested key to its first occurrence after the given parent key,
 * so operations inside a path item highlight the right line even when the
 * same method appears in several path items.
 */
function nestedKeyLocator(parentKey: string, key: string) {
    return (text: string): Range | null => {
        const parent = keyLocator(parentKey)(text);
        if (!parent) {
            return null;
        }
        const rest = text.slice(parent.to);
        const match = keyRegExp(key).exec(rest);
        if (!match) {
            return parent;
        }
        const shifted = {
            ...match,
            index: match.index + parent.to,
        } as RegExpExecArray;
        return keyMatchRange(shifted);
    };
}

function valueLocator(value: string, occurrence = 1) {
    return (text: string): Range | null => {
        let index = -1;
        for (let i = 0; i < occurrence; i += 1) {
            index = text.indexOf(value, index + 1);
            if (index === -1) {
                return null;
            }
        }
        return { from: index, to: index + value.length };
    };
}

function firstLineRange(text: string): Range {
    const lineEnd = text.indexOf('\n');
    return { from: 0, to: lineEnd === -1 ? text.length : lineEnd };
}

function walk(
    node: unknown,
    visit: (key: string, value: unknown) => void
): void {
    if (Array.isArray(node)) {
        node.forEach((item) => walk(item, visit));
        return;
    }
    if (isMapping(node)) {
        for (const [key, value] of Object.entries(node)) {
            visit(key, value);
            walk(value, visit);
        }
    }
}

/**
 * Resolves an internal JSON pointer reference (like #/components/schemas/Pet)
 * against the parsed document. External references are out of scope here
 * because the preview resolves them through the ref resolver.
 */
function resolvesInternally(doc: unknown, ref: string): boolean {
    if (ref === '#') {
        return true;
    }
    if (!ref.startsWith('#/')) {
        return false;
    }
    let current: unknown = doc;
    for (const rawSegment of ref.slice(2).split('/')) {
        const segment = decodeURIComponent(rawSegment)
            .replace(/~1/g, '/')
            .replace(/~0/g, '~');
        if (Array.isArray(current)) {
            const index = Number(segment);
            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= current.length
            ) {
                return false;
            }
            current = current[index];
        } else if (isMapping(current) && segment in current) {
            current = current[segment];
        } else {
            return false;
        }
    }
    return true;
}

function collectStrings(
    spec: unknown,
    key: string,
    predicate: (value: unknown) => boolean
): string[] {
    const found: string[] = [];
    walk(spec, (entryKey, value) => {
        if (entryKey === key && predicate(value)) {
            found.push(value as string);
        }
    });
    return found;
}

function collectSpecIssues(spec: unknown): SpecIssue[] {
    const issues: SpecIssue[] = [];

    if (!isMapping(spec)) {
        issues.push({
            message: 'OpenAPI document must be a mapping at the top level',
            severity: 'error',
        });
        return issues;
    }

    const versionKey =
        'openapi' in spec ? 'openapi' : 'swagger' in spec ? 'swagger' : null;
    if (versionKey === null) {
        issues.push({
            message:
                'Missing "openapi" version field (or the legacy "swagger" field)',
            severity: 'error',
        });
    } else {
        const rawVersion = spec[versionKey];
        const expectedLabel =
            versionKey === 'openapi' ? 'OpenAPI 3.x' : 'Swagger 2.0';
        if (typeof rawVersion === 'number') {
            issues.push({
                message: `Quote the "${versionKey}" value, YAML reads ${rawVersion} as a number, not a version string`,
                severity: 'warning',
                locate: keyLocator(versionKey),
            });
        } else if (typeof rawVersion !== 'string') {
            issues.push({
                message: `"${versionKey}" must be a version string`,
                severity: 'error',
                locate: keyLocator(versionKey),
            });
        } else {
            const valid =
                versionKey === 'openapi'
                    ? /^3\.\d+(?:\.\d+)?$/.test(rawVersion)
                    : rawVersion === '2.0';
            if (!valid) {
                issues.push({
                    message: `"${versionKey}" value "${rawVersion}" does not look like a valid ${expectedLabel} version`,
                    severity: 'warning',
                    locate: keyLocator(versionKey),
                });
            }
        }
    }

    const info = spec.info;
    if (info === undefined) {
        issues.push({
            message: 'Missing required "info" object',
            severity: 'error',
        });
    } else if (!isMapping(info)) {
        issues.push({
            message: '"info" must be a mapping',
            severity: 'error',
            locate: keyLocator('info'),
        });
    } else {
        if (typeof info.title !== 'string') {
            issues.push({
                message: '"info.title" is required and must be a string',
                severity: 'error',
                locate: keyLocator('info'),
            });
        }
        if (typeof info.version !== 'string') {
            issues.push({
                message:
                    '"info.version" is required and must be a quoted string',
                severity: 'error',
                locate: keyLocator('info'),
            });
        }
    }

    if (spec.servers !== undefined && !Array.isArray(spec.servers)) {
        issues.push({
            message: '"servers" must be a list',
            severity: 'error',
            locate: keyLocator('servers'),
        });
    }
    if (spec.tags !== undefined && !Array.isArray(spec.tags)) {
        issues.push({
            message: '"tags" must be a list',
            severity: 'warning',
            locate: keyLocator('tags'),
        });
    }
    for (const field of ['components', 'definitions']) {
        if (spec[field] !== undefined && !isMapping(spec[field])) {
            issues.push({
                message: `"${field}" must be a mapping`,
                severity: 'error',
                locate: keyLocator(field),
            });
        }
    }

    const paths = spec.paths;
    if (paths === undefined) {
        if (spec.webhooks === undefined) {
            issues.push({
                message: 'Missing "paths" object',
                severity: 'warning',
            });
        }
    } else if (!isMapping(paths)) {
        issues.push({
            message: '"paths" must be a mapping of URL paths',
            severity: 'error',
            locate: keyLocator('paths'),
        });
    } else {
        for (const [pathKey, pathItem] of Object.entries(paths)) {
            if (!pathKey.startsWith('/')) {
                issues.push({
                    message: `Path "${pathKey}" must start with a slash`,
                    severity: 'error',
                    locate: keyLocator(pathKey),
                });
                continue;
            }
            if (!isMapping(pathItem)) {
                issues.push({
                    message: `Path item "${pathKey}" must be a mapping`,
                    severity: 'error',
                    locate: keyLocator(pathKey),
                });
                continue;
            }
            for (const [field, value] of Object.entries(pathItem)) {
                const method = field.toLowerCase();
                if (PATH_LEVEL_FIELDS.includes(field)) {
                    continue;
                }
                if (!HTTP_METHODS.includes(method)) {
                    issues.push({
                        message: `Unknown field "${field}" in path item "${pathKey}"`,
                        severity: 'warning',
                        locate: nestedKeyLocator(pathKey, field),
                    });
                    continue;
                }
                const operationName = `${method.toUpperCase()} ${pathKey}`;
                if (!isMapping(value)) {
                    issues.push({
                        message: `Operation "${operationName}" must be a mapping`,
                        severity: 'error',
                        locate: nestedKeyLocator(pathKey, field),
                    });
                    continue;
                }
                if (value.responses === undefined) {
                    issues.push({
                        message: `Operation "${operationName}" has no "responses"`,
                        severity: 'warning',
                        locate: nestedKeyLocator(pathKey, field),
                    });
                }
            }
        }
    }

    const operationIds = collectStrings(
        spec,
        'operationId',
        (value) => typeof value === 'string'
    );
    const seenIds = new Set<string>();
    for (const id of operationIds) {
        if (seenIds.has(id)) {
            continue;
        }
        seenIds.add(id);
        if (operationIds.filter((candidate) => candidate === id).length > 1) {
            issues.push({
                message: `Duplicate operationId "${id}"`,
                severity: 'warning',
                locate: valueLocator(id, 2),
            });
        }
    }

    const refs = collectStrings(
        spec,
        '$ref',
        (value) => typeof value === 'string'
    );
    const reportedRefs = new Set<string>();
    for (const ref of refs) {
        if (!ref.startsWith('#') || reportedRefs.has(ref)) {
            continue;
        }
        reportedRefs.add(ref);
        if (!resolvesInternally(spec, ref)) {
            issues.push({
                message: `Reference "${ref}" does not resolve inside this document`,
                severity: 'error',
                locate: valueLocator(ref),
            });
        }
    }

    return issues;
}

/**
 * Validates the parsed document as an OpenAPI specification and returns
 * lint diagnostics with ranges resolved against the source text. The text
 * offsets match the CodeMirror document, so the ranges can be used as is.
 */
export function validateOpenApiSpec(text: string, spec: unknown): Diagnostic[] {
    return collectSpecIssues(spec).map((issue) => {
        const range = issue.locate?.(text) ?? firstLineRange(text);
        return {
            from: range.from,
            to: range.to,
            severity: issue.severity,
            message: issue.message,
        };
    });
}
