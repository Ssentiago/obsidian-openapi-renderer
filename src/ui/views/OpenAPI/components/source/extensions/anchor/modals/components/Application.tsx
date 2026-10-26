import React, { useState } from 'react';
import {
    OButton,
    OSetting,
    OText,
    SettingRoot,
} from '@obsidian-lib/native-react-components';
import {
    AdditionalDataModal,
    SubmitData,
} from 'ui/views/OpenAPI/components/source/extensions/anchor/modals/additional-data-modal';

const Application: React.FC<{
    modal: AdditionalDataModal;
    onSubmit: (data: SubmitData) => void;
    contextData: {
        string: string;
        line: number;
    };
}> = ({ onSubmit, modal, contextData }) => {
    const [label, setLabel] = useState('');
    const [comment, setComment] = useState('');

    return (
        <SettingRoot>
            <div>
                <h4>
                    {contextData.line}: {contextData.string}
                </h4>
            </div>

            <OSetting name="Label">
                <OText value={label} onChange={setLabel} />
            </OSetting>
            <OSetting name={'Comment'}>
                <OText value={comment} onChange={setComment} />
            </OSetting>

            <OSetting>
                <OButton
                    icon={'save'}
                    tooltip={'Save and exit'}
                    onClick={() => {
                        onSubmit({
                            label,
                            comment,
                        });
                        modal.close();
                    }}
                />
            </OSetting>
        </SettingRoot>
    );
};

export default Application;
