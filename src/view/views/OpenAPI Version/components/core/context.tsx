import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { Specification } from 'indexedDB/database/specification';
import { App } from 'obsidian';
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from 'react';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

export type Mode = 'Normal' | 'Preview' | 'Diff';

interface SpecificationContextProps {
    app: App;
    plugin: OpenAPIRendererPlugin;
    view: VersionView;
    mode: Mode;
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
    specs: Specification[];
    setSpecs: React.Dispatch<React.SetStateAction<Specification[]>>;
    currentSpec: string | Specification | undefined;
    setCurrentSpec: React.Dispatch<
        React.SetStateAction<string | Specification | undefined>
    >;
    selectedSpecs: Specification[];
    setSelectedSpecs: React.Dispatch<React.SetStateAction<Specification[]>>;
    openGroups: Record<string, boolean>;
    setOpenGroups: React.Dispatch<
        React.SetStateAction<Record<string, boolean>>
    >;
    restored: Specification | undefined;
    setRestored: React.Dispatch<
        React.SetStateAction<Specification | undefined>
    >;
    handleBackToList: () => void;
}

const SpecificationContext = createContext<
    SpecificationContextProps | undefined
>(undefined);

export const SpecificationProvider: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    view: VersionView;
    children: ReactNode;
}> = ({ app, plugin, view, children }) => {
    const [mode, setMode] = useState<Mode>('Normal');

    const [specs, setSpecs] = useState<Specification[]>([]);
    const [currentSpec, setCurrentSpec] = useState<
        string | Specification | undefined
    >(undefined);
    const [selectedSpecs, setSelectedSpecs] = useState<Specification[]>([]);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [restored, setRestored] = useState<Specification | undefined>(
        undefined
    );

    const handleBackToList = (): void => {
        setMode('Normal');
        setCurrentSpec(undefined);
        setSelectedSpecs([]);
    };

    const contextValue = useMemo(
        () => ({
            app,
            plugin,
            view,
            mode,
            setMode,
            specs,
            setSpecs,
            currentSpec,
            setCurrentSpec,
            selectedSpecs,
            setSelectedSpecs,
            openGroups,
            setOpenGroups,
            restored,
            setRestored,
            handleBackToList,
        }),
        [
            app,
            plugin,
            specs,
            setSpecs,
            currentSpec,
            setCurrentSpec,
            selectedSpecs,
            setSelectedSpecs,
            openGroups,
            setOpenGroups,
            restored,
            setRestored,
            handleBackToList,
        ]
    );

    return (
        <SpecificationContext.Provider value={contextValue}>
            {children}
        </SpecificationContext.Provider>
    );
};

export const useSpecificationContext = (): SpecificationContextProps => {
    const context = useContext(SpecificationContext);
    if (!context) {
        throw new Error(
            'useSpecificationContext must be used within a SpecificationProvider'
        );
    }
    return context;
};
