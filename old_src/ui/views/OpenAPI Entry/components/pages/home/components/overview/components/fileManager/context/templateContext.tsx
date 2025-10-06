import { requestUrl } from 'obsidian';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import { RequestUrlModal } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/file/modal/request-url-modal';

const TEMPLATES: Record<'empty' | 'url' | 'minimal' | 'rest-api', string> = {
    empty: '',
    url: '',
    minimal:
        "openapi: 3.0.0\ninfo:\n  title: API Title\n  description: API Description\n  version: 1.0.0\nservers:\n  - url: https://api.example.com/v1\npaths:\n  /health:\n    get:\n      summary: Health check\n      responses:\n        '200':\n          description: OK\ncomponents:\n  schemas: {}\n  securitySchemes: {}",
    'rest-api':
        "openapi: 3.0.0\ninfo:\n  title: REST API\n  description: REST API with CRUD operations\n  version: 1.0.0\nservers:\n  - url: https://api.example.com/v1\npaths:\n  /items:\n    get:\n      summary: List items\n      responses:\n        '200':\n          description: List of items\n          content:\n            application/json:\n              schema:\n                type: array\n                items:\n                  $ref: '#/components/schemas/Item'\n    post:\n      summary: Create item\n      requestBody:\n        content:\n          application/json:\n            schema:\n              $ref: '#/components/schemas/NewItem'\n      responses:\n        '201':\n          description: Item created\ncomponents:\n  schemas:\n    Item:\n      type: object\n      properties:\n        id:\n          type: string\n        name:\n          type: string\n    NewItem:\n      type: object\n      properties:\n        name:\n          type: string",
};

interface TemplateContext {
    TEMPLATES: typeof TEMPLATES;
    currentTemplate: keyof typeof TEMPLATES;
    data: string;
    errorFetching: boolean;
    setCurrentTemplate: (template: keyof typeof TEMPLATES) => void;
    setData: (data: string) => void;
    setErrorFetching: (error: boolean) => void;
    openUrlGettingModal: () => void;
    urlDataLoaded?: boolean;
    setUrlDataLoaded: (loaded: boolean | undefined) => void;
}

const TemplateContext = createContext<TemplateContext | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { app } = useEntryContext();
    const [currentTemplate, setCurrentTemplate] =
        useState<keyof typeof TEMPLATES>('empty');
    const [errorFetching, setErrorFetching] = useState(false);
    const [urlDataLoaded, setUrlDataLoaded] = useState<boolean | undefined>(
        undefined
    );

    const [data, setData] = useState<string>('');

    useEffect(() => {
        setData(TEMPLATES[currentTemplate]);
    }, [currentTemplate]);

    const openUrlGettingModal = () => {
        new RequestUrlModal(app, async (url) => {
            try {
                if (!url.trim()) {
                    setUrlDataLoaded(false);
                    return;
                }

                const data = await requestUrl({
                    url: url,
                    method: 'GET',
                    throw: false,
                });

                if (data.status !== 200) {
                    setUrlDataLoaded(false);
                    return;
                }

                const json = data.json;
                if (json) {
                    setData(JSON.stringify(json, null, 2));
                    setUrlDataLoaded(true);
                } else {
                    setUrlDataLoaded(false);
                }
            } catch (err: any) {
                setErrorFetching(true);
            }
        }).open();
    };

    const value = useMemo(() => {
        return {
            TEMPLATES,
            currentTemplate,
            urlDataLoaded,
            setUrlDataLoaded,
            data,
            errorFetching,
            setCurrentTemplate,
            setData,
            setErrorFetching,
            openUrlGettingModal,
        };
    }, [data, currentTemplate, errorFetching]);

    return (
        <TemplateContext.Provider value={value}>
            {children}
        </TemplateContext.Provider>
    );
};

export const useTemplateManager = () => {
    const context = useContext(TemplateContext);
    if (context === undefined) {
        throw new Error(
            'useTemplateManager must be used within a TemplateProvider'
        );
    }
    return context;
};
