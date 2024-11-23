import { AnchorData } from 'indexedDB/database/anchor';
import { moment } from 'obsidian';
import React, { useRef, useState } from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { AnchorModal } from 'ui/views/OpenAPI/components/source/modals/anchors-modal/anchor-modal';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';

const Application: React.FC<{ source: OpenAPISource; modal: AnchorModal }> = ({
    source,
    modal,
}) => {
    const path = useRef(source.view.file?.path);

    const [anchors, setAnchors] = useState<Set<AnchorData>>(
        new Set(source.view.anchors)
    );
    if (!source.editor) {
        return null;
    }

    if (anchors.size === 0) {
        return (
            <div>
                <h5>No available anchors for this file</h5>
                <p>
                    This file doesn't have any anchors yet. You can add anchors
                    by clicking on the gutter next to the desired line in the
                    editor. Right-clicking (context menu) on the gutter also
                    allows you to add an anchor with a custom label and comment.
                </p>
            </div>
        );
    }

    return Array.from(anchors)
        .sort((a, b) => a.pos - b.pos)
        .map((anchor) => {
            const line = source.editor!.state.doc.lineAt(anchor.pos);

            return (
                <ReactObsidianSetting
                    key={anchor.pos.toString()}
                    name={`${anchor.label ?? anchor.line}`}
                    addMultiDesc={(multiDesc) => {
                        multiDesc.addDesc(`Line: ${anchor.line}`);
                        multiDesc.addDesc(`Position: ${anchor.pos}`);
                        multiDesc.addDesc(
                            `Time: ${moment(anchor.time * 1000).format('YYYY-MM-DD HH:mm:ss')}`
                        );
                        if (anchor.label) {
                            multiDesc.addDesc(`Label: ${anchor.label}`);
                        }
                        if (anchor.comment) {
                            multiDesc.addDesc(`Comment: ${anchor.comment}`);
                        }
                        return multiDesc;
                    }}
                    addButtons={[
                        (button) => {
                            button.setIcon('move-right');
                            button.setTooltip('Go to anchor');
                            button.onClick(() => {
                                source.editor!.dispatch({
                                    selection: {
                                        anchor: anchor.pos,
                                        head: anchor.pos,
                                    },
                                    scrollIntoView: true,
                                });
                                modal.close();
                            });
                            return button;
                        },
                        (button) => {
                            button.setIcon('copy');
                            button.setTooltip('Copy URI link');
                            button.onClick(async () => {
                                if (!path.current) {
                                    return;
                                }

                                const link = `obsidian://openapi-open?openapiPath=${path.current}&line=${anchor.line}`;
                                await navigator.clipboard.writeText(link);
                                source.plugin.showNotice(
                                    'Link copied to clipboard'
                                );
                            });
                            return button;
                        },
                    ]}
                />
            );
        });
};
export default Application;
