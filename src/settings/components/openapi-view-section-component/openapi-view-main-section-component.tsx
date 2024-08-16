import React, { useEffect, useRef, useState } from 'react';
import { App } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import PreviewSectionComponent from './preview-section-component';
import SourceSectionComponent from './source-section-component';
import { SectionHeaderContainer } from './section-header-styled-component';
import OpenAPIViewSectionComponent from './openapi-view-section-component';
import { SettingsContainer } from '../container-styled-component';

const OpenapiViewMainSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const openAPIViewRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const sourceRef = useRef<HTMLDivElement>(null);

    const [refsSet, setRefsSet] = useState(false);

    useEffect(() => {
        if (openAPIViewRef.current && previewRef.current && sourceRef.current) {
            setRefsSet(true);
        }
    }, [openAPIViewRef.current, previewRef.current, sourceRef.current]);

    return (
        <>
            <SettingsContainer className={'openapi-renderer-settings'}>
                <div ref={openAPIViewRef}>
                    <OpenAPIViewSectionComponent
                        app={app}
                        plugin={plugin}
                        containerEl={openAPIViewRef.current}
                    />
                </div>
                <SectionHeaderContainer>Preview mode</SectionHeaderContainer>
                <div ref={previewRef}>
                    <PreviewSectionComponent
                        app={app}
                        plugin={plugin}
                        containerEl={previewRef.current}
                    />
                </div>
                <SectionHeaderContainer>Source mode</SectionHeaderContainer>
                <div ref={sourceRef}>
                    <SourceSectionComponent
                        app={app}
                        plugin={plugin}
                        containerEl={sourceRef.current}
                    />
                </div>
            </SettingsContainer>
        </>
    );
};

export default OpenapiViewMainSectionComponent;
