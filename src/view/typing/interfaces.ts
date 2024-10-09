interface ThemeController {
    initializeTheme: () => void;
    toggleThemeFollowObsidian: () => void;
    syncWithObsidian: () => Promise<void>;
    toggleThemeManually: () => void;
    requestThemeUpdate: () => Promise<void>;
    themeButtonIcon: 'moon' | 'sun';
    themeUpdate: () => Promise<void>;
}
export interface OpenAPIViewComponent {
    controller: {
        themeController: ThemeController;
    };

    themeMode: string;

    render(): void;

    show(): void;

    hide(): void;

    close(): void;

    getComponentData(): string;
}

export interface SourceComponent extends OpenAPIViewComponent {
    clear(): void;
}

export interface PreviewComponent extends OpenAPIViewComponent {}
