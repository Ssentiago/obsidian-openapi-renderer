import React, { useCallback, useEffect, useState } from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import HelperButton from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/HelperButton';
import { TemplateSelector } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/styled/styled';
import { ButtonState } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/typing/constants';
import { useTemplateManager } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/context/templateContext';

const Template = () => {
    const { app } = useEntryContext();
    const [state, setState] = useState<ButtonState>(ButtonState.Null);

    const {
        currentTemplate,
        setCurrentTemplate,
        TEMPLATES,
        setData,
        openUrlGettingModal,
        urlDataLoaded,
        setUrlDataLoaded,
    } = useTemplateManager();

    useEffect(() => {
        if (currentTemplate !== 'url') {
            setState(ButtonState.Null);
            setData('');
            setUrlDataLoaded(undefined);
        }
    }, [currentTemplate]);

    useEffect(() => {
        if (urlDataLoaded === true) {
            setState(ButtonState.Success);
        } else if (urlDataLoaded === false) {
            setState(ButtonState.Error);
        }
    }, [urlDataLoaded]);

    const onHelperButtonClick = () => {
        switch (state) {
            case ButtonState.Null:
            case ButtonState.Error:
                setState(ButtonState.Loading);
                state === ButtonState.Error && setUrlDataLoaded(true);
                openUrlGettingModal();
                break;
        }
    };

    const onOptionsChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setCurrentTemplate(e.target.value as keyof typeof TEMPLATES);
        },
        [app]
    );

    return (
        <>
            <TemplateSelector
                onChange={onOptionsChange}
                aria-label={
                    'Select start template for new openapi specification'
                }
            >
                {Object.keys(TEMPLATES).map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </TemplateSelector>
            {currentTemplate === 'url' && (
                <HelperButton state={state} onClick={onHelperButtonClick} />
            )}
        </>
    );
};

export default Template;
