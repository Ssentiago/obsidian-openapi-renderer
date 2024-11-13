import ResourceManager from 'core/resource-manager';
import { Specification } from 'indexedDB/database/specification';
import { moment } from 'obsidian';
import React, { useEffect, useRef, useState } from 'react';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { useSpecificationContext } from 'view/views/OpenAPI Version/components/core/context';
import { SpecDetails } from 'view/views/OpenAPI Version/components/modes/preview/styled/previewStyled';
import { Button } from 'view/views/OpenAPI Version/components/modes/styled/common-styled';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

export const Preview: React.FC<{
    view: VersionView;
    data: string;
    resourceManager: ResourceManager;
}> = ({ view, data, resourceManager }) => {
    const { handleBackToList, currentSpec } = useSpecificationContext();
    const [combinedCSS, setCombinedCSS] = useState<string>('');
    const swaggerUIRef = useRef<HTMLDivElement | null>(null);

    const parsedSpec = JSON.parse(data);

    useEffect(() => {
        const initSwagger = async (): Promise<void> => {
            if (!resourceManager.swaggerUIBundle) {
                await resourceManager.initSwaggerUIBundle();
            }

            if (swaggerUIRef.current) {
                if (!resourceManager.swaggerUIBundle) {
                    return;
                }
                resourceManager.swaggerUIBundle({
                    spec: parsedSpec,
                    domNode: swaggerUIRef.current,
                    presets: [
                        resourceManager.swaggerUIBundle.presets.apis,
                        resourceManager.swaggerUIBundle
                            .SwaggerUIStandalonePreset,
                    ],
                    layout: 'BaseLayout',
                });
            }
        };

        initSwagger().catch((err) => err);

        return (): void => {
            if (swaggerUIRef.current) {
                swaggerUIRef.current.empty();
            }
        };
    }, [data, resourceManager]);

    useEffect((): void => {
        const fetchCombinedCSS = async () => {
            const css = await view.controller.versionUtils.getCombinedCSS();
            setCombinedCSS(css);
        };

        fetchCombinedCSS().catch((err) => err);
    }, [view.controller.versionUtils]);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}
            >
                <Button aria-label={'Back to main'} onClick={handleBackToList}>
                    <RiArrowGoBackLine />
                </Button>
            </div>
            {currentSpec instanceof Specification && (
                <>
                    <h1>Details</h1>
                    <SpecDetails>
                        <p>Name: {currentSpec.name}</p>
                        <p>Version: {currentSpec.version}</p>
                        <p>
                            Created At:{' '}
                            {moment(currentSpec.createdAt).toLocaleString()}
                        </p>
                    </SpecDetails>
                    <div
                        style={{
                            borderBottom: 'var(--interactive-accent) 2px solid',
                        }}
                    ></div>
                </>
            )}
            <style>{combinedCSS}</style>
            <div ref={swaggerUIRef} />
        </>
    );
};

export default Preview;
