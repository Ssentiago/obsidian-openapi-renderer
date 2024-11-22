import { Specification } from 'indexedDB/database/specification';
import { moment } from 'obsidian';
import React, { useEffect, useRef, useState } from 'react';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { SwaggerUIBundle } from 'swagger-ui-dist';
import { useSpecificationContext } from 'view/views/OpenAPI Version/components/core/context';
import { SpecDetails } from 'view/views/OpenAPI Version/components/modes/preview/styled/previewStyled';
import { Button } from 'view/views/OpenAPI Version/components/modes/styled/common-styled';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

export const Preview: React.FC<{
    view: VersionView;
    data: string;
}> = ({ view, data }) => {
    const { handleBackToList, currentSpec } = useSpecificationContext();
    const [combinedCSS, setCombinedCSS] = useState<string>('');
    const swaggerUIRef = useRef<HTMLDivElement | null>(null);

    const parsedSpec = JSON.parse(data);

    useEffect(() => {
        if (swaggerUIRef.current) {
            SwaggerUIBundle({
                spec: parsedSpec,
                domNode: swaggerUIRef.current,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset,
                ],
                layout: 'BaseLayout',
            });
        }

        return (): void => {
            if (swaggerUIRef.current) {
                swaggerUIRef.current.empty();
            }
        };
    }, [data]);

    useEffect((): void => {
        const css = view.controller.versionUtils.getCombinedCSS();
        setCombinedCSS(css);
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
