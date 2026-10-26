import { AnchorData } from 'indexedDB/database/anchor';
import { moment } from 'obsidian';
import React, { useState } from 'react';
import {
    OExtraButton,
    OSetting,
    SettingRoot,
} from '@obsidian-lib/native-react-components';
import { AnchorModal } from 'ui/views/OpenAPI/components/source/modals/anchors-modal/anchor-modal';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';

const Application: React.FC<{ source: OpenAPISource; modal: AnchorModal }> = ({
    source,
    modal,
}) => {
    const path = source.view.file?.path;

    const [anchors] = useState<Set<AnchorData>>(
        new Set(source.view.anchors)
    );
    if (!source.editor) {
        return null;
    }

    if (anchors.size === 0) {
        return (
            <SettingRoot>
                <div>
                    <h5>No available anchors for this file</h5>
                    <p>
                        This file doesn't have any anchors yet. You can add
                        anchors by clicking on the gutter next to the desired
                        line in the editor. Right-clicking (context menu) on the
                        gutter also allows you to add an anchor with a custom
                        label and comment.
                    </p>
                </div>
            </SettingRoot>
        );
    }

    return (
        <SettingRoot>
            {Array.from(anchors)
                .sort((a, b) => a.pos - b.pos)
                .map((anchor) => {
                    const desc = [
                        `Line: ${anchor.line}`,
                        `Position: ${anchor.pos}`,
                        `Time: ${moment(anchor.time * 1000).format('YYYY-MM-DD HH:mm:ss')}`,
                    ];
                    if (anchor.label) {
                        desc.push(`Label: ${anchor.label}`);
                    }
                    if (anchor.comment) {
                        desc.push(`Comment: ${anchor.comment}`);
                    }

                    return (
                        <OSetting
                            key={anchor.pos.toString()}
                            name={`${anchor.label ?? anchor.line}`}
                            desc={desc}
                        >
                            <OExtraButton
                                icon={'move-right'}
                                tooltip={'Go to anchor'}
                                onClick={() => {
                                    source.editor!.dispatch({
                                        selection: {
                                            anchor: anchor.pos,
                                            head: anchor.pos,
                                        },
                                        scrollIntoView: true,
                                    });
                                    modal.close();
                                }}
                            />
                            <OExtraButton
                                icon={'copy'}
                                tooltip={'Copy URI link'}
                                onClick={async () => {
                                    if (!path) {
                                        return;
                                    }

                                    const link = `obsidian://openapi-open?openapiPath=${path}&line=${anchor.line}`;
                                    await navigator.clipboard.writeText(link);
                                    source.plugin.showNotice(
                                        'Link copied to clipboard'
                                    );
                                }}
                            />
                        </OSetting>
                    );
                })}
        </SettingRoot>
    );
};
export default Application;
