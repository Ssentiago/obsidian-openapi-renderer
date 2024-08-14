import { ItemView, WorkspaceLeaf } from 'obsidian';
import { OPENAPI_ENTRY_VIEW_TYPE } from '../types';

export class OpenAPIEntryView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return OPENAPI_ENTRY_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'OpenAPI Version View';
    }

    async onOpen(): Promise<void> {}

    async onClose(): Promise<void> {}
}
