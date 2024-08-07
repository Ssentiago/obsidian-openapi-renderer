import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import { eventID, RenderingMode } from 'typing/constants';
import { setIcon } from 'obsidian';

export class OpenAPIController {
    constructor(public view: OpenAPIView) {
        this.initializeActions();
        this.setupEventListeners();
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

    get modeIcon(): 'book-open' | 'pen' {
        return this.view.mode === RenderingMode.Preview ? 'book-open' : 'pen';
    }

    initializeActions(): void {
        const changeModeButton = this.view.addAction(
            this.modeIcon,
            'Change mode',
            () => this.view.onSwitch()
        );
        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            eventID.SwitchModeState,
            async () => {
                setIcon(changeModeButton, this.modeIcon);
            }
        );
    }

    setupEventListeners(): void {
        this.view.containerEl.setAttr('tabindex', '0');
        this.view.contentEl.setAttr('tabindex', '0');
        this.view.plugin.registerDomEvent(
            this.view.containerEl,
            'keyup',
            (event: KeyboardEvent) => {
                if (event.ctrlKey && event.code === 'KeyE') {
                    this.view.onSwitch();
                }
            }
        );
    }
}
