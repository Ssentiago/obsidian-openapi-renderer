import {App, Modal} from 'obsidian';
import {Params} from "../typing/interfaces";
import {IframeCreator} from 'typing/types'

/**
 * Represents a modal for displaying Swagger UI.
 */
export class SwaggerUIModal extends Modal {
    htmlPath: string
    specPath: string
    width: string
    height: string
    iframeCreator: IframeCreator

    constructor(app: App,
                htmlPath: string,
                specPath: string,
                width: string,
                height: string,
                iframeCreator: IframeCreator ) {
        super(app);
        this.htmlPath = htmlPath
        this.specPath = specPath
        this.width = width
        this.height = height
        this.iframeCreator = iframeCreator;
    }

    /**
     * Asynchronous method called when opening the modal component.
     * Initializes the modal with Swagger UI content.
     */
    async onOpen(): Promise<void> {
        const {contentEl} = this
        contentEl.setText('Swagger UI');
        const iframe  = this.iframeCreator(
            {
                htmlPath: this.htmlPath,
                specPath: this.specPath,
                width: this.width,
                height: this.height,
            } as Params
        )

        contentEl.appendChild(iframe)
        contentEl.show()
    }

    /**
     * Method called when closing the modal component.
     * Clears the content element of the modal.
     */
    onClose(): void {
        const {contentEl} = this
        contentEl.empty()
    }
}