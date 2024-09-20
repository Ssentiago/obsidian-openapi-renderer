export interface IOpenAPIViewComponent {
    render(): void;

    hide(): void;

    clear(): void;

    close(): void;

    getComponentData(): string;
}
