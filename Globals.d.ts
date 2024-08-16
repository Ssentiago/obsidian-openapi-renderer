declare module 'web-worker:*' {
    const WorkerFactory: new () => Worker;
    export default WorkerFactory;
}
declare module 'jsondiffpatch/formatters/html' {
    import { Delta } from 'jsondiffpatch';
    export default class HtmlFormatter {
        format(delta: Delta, left?: unknown): string | undefined;
    }

    export function hideUnchanged(node?: Element, delay?: number): void;

    export function showUnchanged(
        show?: boolean,
        node?: Element | null,
        delay?: number
    ): void;
}
