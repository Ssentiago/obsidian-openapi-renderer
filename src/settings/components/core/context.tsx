import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { App } from 'obsidian';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

interface SettingsContextProps {
    plugin: OpenAPIRendererPlugin;
    app: App;
    forceReload: () => void;
    reloadCount: number;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

/**
 * Provides a context for the settings pages.
 *
 * @param {{ children: ReactNode }} props
 * @param {ReactNode} props.children - The content to be rendered within the
 * context.
 *
 * @returns {ReactElement}
 */
export const SettingProvider: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    children: ReactNode;
}> = ({ app, plugin, children }) => {
    const [reloadCount, setReloadCount] = useState(0);

    const forceReload = useCallback(() => {
        setReloadCount((prev) => prev + 1);
    }, []);

    const contextValue = useMemo(
        () => ({
            app,
            plugin,
            forceReload,
            reloadCount,
        }),
        [app, plugin, forceReload, reloadCount]
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

/**
 * Retrieves the settings context.
 *
 * @returns {SettingsContextProps} The settings context.
 *
 * @throws {Error} If the context is used outside a `SettingsProvider`.
 */
export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error(
            'useSettingsContext must be used within an EntryProvider'
        );
    }
    return context;
};
