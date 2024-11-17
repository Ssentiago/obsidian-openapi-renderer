import React, { useRef } from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import {
    AdditionalDataModal,
    SubmitData,
} from 'view/views/OpenAPI/components/source/extensions/anchor/modals/additional-data-modal';

const Application: React.FC<{
    modal: AdditionalDataModal;
    onSubmit: (data: SubmitData) => void;
    contextData: {
        string: string;
        line: number;
    };
}> = ({ onSubmit, modal, contextData }) => {
    const labelRef = useRef<string>('');
    const commentRef = useRef<string>('');

    return (
        <>
            <div>
                <h4>
                    {contextData.line}: {contextData.string}
                </h4>
            </div>

            <ReactObsidianSetting
                name="Label"
                addTexts={[
                    (input) => {
                        input.setValue(labelRef.current);
                        input.onChange((value) => {
                            labelRef.current = value;
                        });
                        return input;
                    },
                ]}
            />
            <ReactObsidianSetting
                name={'Comment'}
                addTexts={[
                    (input) => {
                        input.setValue(commentRef.current);
                        input.onChange((value) => {
                            commentRef.current = value;
                        });
                        return input;
                    },
                ]}
            />

            <ReactObsidianSetting
                addButtons={[
                    (button) => {
                        button.setIcon('save');
                        button.setTooltip('Save and exit');
                        button.onClick(() => {
                            onSubmit({
                                label: labelRef.current,
                                comment: commentRef.current,
                            });
                            modal.close();
                        });
                        return button;
                    },
                ]}
            />
        </>
    );
};

export default Application;
