import React, {
    createContext,
    ReactNode,
    useContext,
    useRef,
    useState,
} from 'react';

interface SettingsContextProps {
    ref: React.RefObject<HTMLDivElement>;
    currentTab: string;
    setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

export const SettingProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [currentTab, setCurrentTab] = useState<string>('general');

    return (
        <SettingsContext.Provider
            value={{
                ref,
                currentTab,
                setCurrentTab,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useEntryContext must be used within an EntryProvider');
    }
    return context;
};
