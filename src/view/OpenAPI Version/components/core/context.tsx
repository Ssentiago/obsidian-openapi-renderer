import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Specification } from 'indexedDB/database/specification';

interface SpecificationContextProps {
    isPreviewMode: boolean;
    setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
    isDiffMode: boolean;
    setDiffMode: React.Dispatch<React.SetStateAction<boolean>>;
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
}

const SpecificationContext = createContext<
    SpecificationContextProps | undefined
>(undefined);

export const SpecificationProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [isPreviewMode, setPreviewMode] = useState<boolean>(false);
    const [isDiffMode, setDiffMode] = useState<boolean>(false);
    const [specs, setSpecs] = useState<Specification[]>([]);
    const [currentSpec, setCurrentSpec] = useState<
        string | Specification | undefined
    >(undefined);
    const [selectedSpecs, setSelectedSpecs] = useState<Specification[]>([]);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [restored, setRestored] = useState<Specification | undefined>(
        undefined
    );
    return (
        <SpecificationContext.Provider
            value={{
                isPreviewMode,
                setPreviewMode,
                isDiffMode,
                setDiffMode,
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
            }}
        >
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
