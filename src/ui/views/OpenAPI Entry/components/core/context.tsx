import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { specData } from 'export/interfaces';
import { App, TAbstractFile, TFile, TFolder } from 'obsidian';
import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from 'react';
import { EntryViewData } from 'indexedDB/typing/interfaces';
import { EntryView } from 'ui/views/OpenAPI Entry/entry-view';

interface EntryContextProps {
    view: EntryView;
    app: App;
    plugin: OpenAPIRendererPlugin;
    specData: EntryViewData;
    setSpecData: React.Dispatch<React.SetStateAction<EntryViewData>>;
    folderMap: Map<TFolder | null, TAbstractFile[]>;
    setFolderMap: React.Dispatch<
        React.SetStateAction<Map<TFolder | null, TAbstractFile[]>>
    >;
    // columnValue: number;
    // setColumnValue: React.Dispatch<React.SetStateAction<number>>;
    // detailsOpen: Record<string, boolean>;
    // setDetailsOpen: React.Dispatch<
    //     React.SetStateAction<Record<string, boolean>>
    // >;
    // currentPage: string;
    // setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
}

const EntryContext = createContext<EntryContextProps | undefined>(undefined);

export const EntryProvider: React.FC<{
    view: EntryView;
    app: App;
    plugin: OpenAPIRendererPlugin;
    children: ReactNode;
}> = ({ view, app, plugin, children }) => {
    const [specData, setSpecData] = useState<EntryViewData>({});

    const [folderMap, setFolderMap] = useState<
        Map<TFolder | null, TAbstractFile[]>
    >(new Map());

    const [flattenMap, setFlattenMap] = useState<TFile[]>([]);

    const contextValue = useMemo(
        () => ({
            view,
            app,
            plugin,
            specData,
            setSpecData,
            folderMap,
            setFolderMap,
        }),
        [view, app, plugin, specData, setSpecData, folderMap, setFolderMap]
    );

    return (
        <EntryContext.Provider value={contextValue}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const context = useContext(EntryContext);
    if (context === undefined) {
        throw new Error('useEntryContext must be used within an EntryProvider');
    }
    return context;
};
