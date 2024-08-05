import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import { RenderingMode } from 'typing/constants';
import { setIcon } from 'obsidian';

export class OpenAPIController {
    constructor(public view: OpenAPIView) {
        this.initializeActions();
    }

    get newMode(): RenderingMode {
        switch (this.view.mode) {
            case RenderingMode.Preview:
                return RenderingMode.Source;
            case RenderingMode.Source:
                return RenderingMode.Preview;
            default:
                throw new Error('Unsupported mode');
        }
    }

    get previewIcon(): 'book-open' | 'pen' {
        return this.view.mode === RenderingMode.Preview ? 'book-open' : 'pen';
    }

    clearActions(): void {
        const viewActions =
            this.view.containerEl.querySelector('.view-actions');
        if (viewActions) {
            const ownButtons = viewActions.querySelectorAll(
                '.openapi-renderer-action-button'
            );
            ownButtons.forEach((button) => {
                button.remove();
            });
        }
    }

    initializeActions(): void {
        const changeButton = this.view.addAction(
            this.previewIcon,
            'Change mode',
            () => {
                this.view.onSwitch();
                setIcon(changeButton, this.previewIcon);
            }
        );
    }
}
