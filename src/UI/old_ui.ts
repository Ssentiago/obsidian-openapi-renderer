// import {MarkdownView, setIcon, WorkspaceLeaf} from 'obsidian';
// import {OpenAPIPluginContext} from "./contextManager";
// import {ButtonConfig, UIPluginSettings} from './interfaces'
// import {ButtonLocation, eventID} from "./types";
// import {UpdateButtonSettingEvent, UpdateServerButtonSettingEvent} from "./eventEmitter";
//
//
// export default class UIManager {
//     private buttonManager: ButtonManager;
//     private buttonFactory: ButtonFactory;
//     appContext!: OpenAPIPluginContext
//
//     constructor(appContext: OpenAPIPluginContext) {
//         this.appContext = appContext;
//         this.buttonManager = new ButtonManager(this);
//         this.buttonFactory = new ButtonFactory(this);
//     }
//
//     async initializeUI() {
//         this.appContext.app.workspace.onLayoutReady(this.initializeUIManager.bind(this))
//     }
//
//     async initializeUIManager() {
//         await this.createAllButtons();
//         await this.updateButtonVisibility();
//         this.registerEvents();
//         this.appContext.plugin.register(this.removeAllButtons.bind(this));
//     }
//
//     private async createAllButtons() {
//         const configs = this.buttonFactory.createAllButtonConfigs();
//         await Promise.all(configs.map(config => this.buttonManager.createButton(config)));
//     }
//
//     private async removeAllButtons() {
//         for (const [location, buttonsMap] of this.buttonManager.buttons) {
//             for (const [id, button] of buttonsMap) {
//                 button.htmlElement?.remove()
//             }
//         }
//         this.buttonManager.buttons.clear()
//     }
//
//     private async updateButtonVisibility() {
//         const view = this.appContext.app.workspace.getActiveViewOfType(MarkdownView)
//         if (!view) return;
//         await this.buttonManager.updateButtonsVisibility(view);
//     }
//
//     private async updateButtonVisibilityByLocationAndID(location: ButtonLocation, id: string) {
//         this.buttonManager.updateButtonVisibilityByLocationAndID(location, id)
//     }
//
//     async updateToolbar(leaf: WorkspaceLeaf) {
//         const isMarkdownView = leaf.view instanceof MarkdownView
//         const view = this.appContext.app.workspace.getActiveViewOfType(MarkdownView)
//         const toolBarContainer = this.buttonManager.getActionsContainer(view)
//         if (toolBarContainer) {
//             const isAnyButtonInContainer = toolBarContainer
//                 .querySelector<HTMLButtonElement>(`.openapi-renderer-toolbar-button`);
//
//
//             if (isAnyButtonInContainer) {
//                 return;
//             }
//
//             const toolbarButtons = this.buttonManager.buttons.get('toolbar');
//             if (toolbarButtons) {
//                 const buttonPromises = Array.from(toolbarButtons)
//                     .map(async ([id, buttonConfig]) => {
//                         if (this.buttonManager.shouldButtonBeVisible(buttonConfig, 'toolbar', isMarkdownView)) {
//                             await this.buttonManager.createButton(buttonConfig);
//                             await this.updateButtonVisibilityByLocationAndID('toolbar', buttonConfig.id)
//                         }
//                     });
//
//                 await Promise.all(buttonPromises);
//             }
//         }
//     };
//
//     private registerEvents() {
//
//         this.appContext.plugin.registerEvent(
//             this.appContext.app.workspace.on('active-leaf-change', async (leaf) => {
//                 if (leaf?.view instanceof MarkdownView) {
//
//                     await this.updateButtonVisibility();
//                     await this.updateToolbar(leaf)
//                 }
//             })
//         );
//
//         this.appContext.plugin.observer.subscribe(
//             this.appContext.app.workspace,
//             eventID.UpdateServerButtonSetting,
//             this.handleSettingsChange.bind(this)
//         )
//
//         this.appContext.plugin.observer.subscribe(
//             this.appContext.app.workspace,
//             eventID.UpdateButtonSetting,
//             this.handleSettingsChange.bind(this)
//         )
//
//         // this.appContext.plugin.observer.unsubscribeAll()
//
//
//     }
//
//     async handleSettingsChange(event: UpdateServerButtonSettingEvent) {
//         debugger
//         const location = event.data.location
//         const oldLocation = event.data.oldLocation
//         const buttonId = event.data.buttonID
//         if (oldLocation) {
//             await this.updateButtonVisibilityByLocationAndID(oldLocation, buttonId)
//         }
//         await this.updateButtonVisibilityByLocationAndID(location, event.data.buttonID)
//     }
//
//     get settings(): UIPluginSettings {
//         return {
//             isCreateServerButton: this.appContext.plugin.settings.isCreateServerButton,
//             isCreateCommandButtons: this.appContext.plugin.settings.isCreateCommandButtons,
//             serverButtonLocation: this.appContext.plugin.settings.serverButtonLocation,
//             commandButtonLocation: this.appContext.plugin.settings.commandButtonLocation
//         } as UIPluginSettings;
//     }
//
//     updateServerButtonIcon(isRunning: boolean, button: HTMLElement) {
//         this.buttonFactory.updateServerButtonIcon(isRunning, button);
//     }
//
//     async toggleServer(event: MouseEvent) {
//         const button = event.currentTarget as HTMLElement;
//         const isRunning = this.appContext.plugin.server.isRunning();
//
//         if (isRunning) {
//             const isStopped = await this.appContext.plugin.server.stop();
//             this.updateServerButtonIcon(!isStopped, button);
//             isStopped && this.appContext.plugin.showNotice(`Server stopped.`);
//         } else {
//             const isStarted = await this.appContext.plugin.server.start();
//             this.updateServerButtonIcon(isStarted, button);
//             const msg = isStarted ? 'Server started'
//                 : 'Cannot start the server... Try again'
//             this.appContext.plugin.showNotice(msg)
//         }
//     }
//
// }
//
// class ButtonManager {
//     buttons: Map<ButtonLocation, Map<string, ButtonConfig>> = new Map();
//     uiManager!: UIManager;
//
//
//     constructor(uiManager: UIManager) {
//         this.uiManager = uiManager;
//
//         [RIBBON_LOCATION, 'statusbar', 'toolbar'].forEach(location => {
//             this.buttons.set(location as ButtonLocation, new Map<string, ButtonConfig>());
//         });
//     }
//
//     async createButton(config: ButtonConfig): Promise<void> {
//         const buttonMap = this.buttons.get(config.location);
//         if (!buttonMap) {
//             // console.error(`Invalid button location: ${config.location}`);
//             return;
//         }
//
//         const htmlElement = await this.createButtonElement(config);
//         if (htmlElement) {
//             config.htmlElement = htmlElement;
//             buttonMap.set(config.id, config);
//         }
//     }
//
//     async createButtonElement(config: ButtonConfig): Promise<HTMLElement | undefined> {
//         switch (config.location) {
//             case RIBBON_LOCATION:
//                 return this.createRibbonButton(config);
//             case 'statusbar':
//                 return this.createStatusBarButton(config);
//             case 'toolbar':
//                 return this.createToolBarButton(config);
//             default:
//                 return undefined;
//         }
//     }
//
//     private createRibbonButton(config: ButtonConfig): HTMLElement {
//         const button = this.uiManager.appContext.plugin.addRibbonIcon(config.icon, config.title, config.onClick);
//         button.setAttribute('id', config.id);
//         return button;
//     }
//
//     private createStatusBarButton(config: ButtonConfig): HTMLElement {
//         const button = this.uiManager.appContext.plugin.addStatusBarItem();
//         setIcon(button, config.icon);
//         button.setAttribute('aria-label', config.title);
//         button.setAttribute('id', config.id);
//         button.addEventListener('click', config.onClick);
//         return button;
//     }
//
//     private createToolBarButton(config: ButtonConfig): HTMLElement {
//         const button = document.createElement("button");
//         button.className = `${config.id}-button clickable-icon view-action openapi-renderer-toolbar-button`;
//         setIcon(button, config.icon);
//         button.setAttribute('aria-label', config.title);
//         button.setAttribute('id', config.id);
//         button.addEventListener('click', config.onClick);
//         const view = this.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView)
//         if (view) {
//             const toolbarContainer = this.getActionsContainer(view)
//             if (toolbarContainer) {
//                 toolbarContainer.prepend(button);
//             }
//         }
//         return button;
//     }
//
//     getActionsContainer(view: MarkdownView | null): Element | null {
//         if (view) {
//             return view.containerEl.querySelector(".view-header .view-actions");
//         }
//         return null
//     }
//
//     async updateButtonsVisibility(view: MarkdownView) {
//         const isMarkdownView = !!view
//         // console.log('current settings from UI manager', this.uiManager.settings)
//         // console.log('current settings from MAIN', this.uiManager.appContext.plugin.settings)
//         for (const [location, buttonMap] of this.buttons) {
//             for (const config of buttonMap.values()) {
//                 const isVisible = this.shouldButtonBeVisible(config, location, isMarkdownView);
//                 // console.log('isVisible?', isVisible)
//                 this.updateButtonVisibility(config, isVisible);
//             }
//         }
//     }
//
//     updateButtonVisibilityByLocationAndID(location: ButtonLocation, id: string) {
//         const leaf = this.uiManager.appContext.app.workspace.getLeaf()
//         if (!leaf) return;
//         const isMarkdownView = leaf.view instanceof MarkdownView;
//         // console.log('Updating button by its location and id')
//         const btns = this.buttons.get(location)
//         console.log(btns)
//         const config = this.buttons.get(location)?.get(id);
//         if (config) {
//             const isVisible = this.shouldButtonBeVisible(config, location, isMarkdownView);
//             // console.log('isVisible?', isVisible)
//             this.updateButtonVisibility(config, isVisible);
//         }
//     }
//
//     shouldButtonBeVisible(config: ButtonConfig, location: ButtonLocation, isMarkdownView: boolean): boolean {
//         // console.log('Button Config: ', config);
//         // console.log('Location: ', location);
//
//         const isServerButton = config.id.includes('openapi-renderer-server');
//         const isCommandButton = config.id.includes('openapi-renderer') || config.id.includes('openapi-refresher');
//
//         // console.log('isServerButton', isServerButton);
//         // console.log('isCommandButton', isCommandButton);
//
//         const isCreationAllowedNow = isServerButton
//             ? this.uiManager.settings.isCreateServerButton
//             : this.uiManager.settings.isCreateCommandButtons;
//
//         // console.log('isCreationAllowedNow', isCreationAllowedNow);
//
//         const isCorrectLocation = isServerButton
//             ? this.uiManager.settings.serverButtonLocation === location
//             : this.uiManager.settings.commandButtonLocation === location;
//
//         // console.log('isCorrectLocation', isCorrectLocation);
//
//         const isVisibleInCurrentView = location === RIBBON_LOCATION || isMarkdownView;
//         // console.log('isVisibleInCurrentView', isVisibleInCurrentView);
//
//         const finalResult = isCreationAllowedNow && isCorrectLocation && isVisibleInCurrentView;
//         // console.log('FinalResult:', finalResult);
//
//         return finalResult;
//     }
//
//     protected updateButtonVisibility(config: ButtonConfig, isVisible: boolean) {
//         const button = config.htmlElement
//         // console.log('got button?', button)
//         if (button) {
//             setTimeout(() => {
//                 button.style.setProperty('display', isVisible ? 'block' : 'none', 'important');
//                 // console.log('updated button visibility')
//             }, 0);
//         }
//
//     }
//
//
// }
//
// class ButtonFactory {
//     uiManager: UIManager;
//
//     constructor(uiManager: UIManager) {
//         this.uiManager = uiManager;
//     }
//
//     createAllButtonConfigs(): ButtonConfig[] {
//         const allConfigs: ButtonConfig[] = [];
//         const locations: ButtonLocation[] = [RIBBON_LOCATION, 'statusbar', 'toolbar'];
//
//         for (const location of locations) {
//             allConfigs.push(this.createServerButtonConfig(location));
//             allConfigs.push(this.createRenderButtonConfig(location));
//             allConfigs.push(this.createRefreshButtonConfig(location));
//         }
//         // console.log('all configs:', allConfigs)
//         return allConfigs;
//     }
//
//     private createServerButtonConfig(location: ButtonLocation): ButtonConfig {
//         return {
//             id: `openapi-renderer-server`,
//             icon: this.uiManager.appContext.plugin.server.isRunning() ? 'wifi' : 'wifi-off',
//             title: 'Toggle OpenAPI Renderer Server',
//             onClick: (event: MouseEvent) => this.uiManager.toggleServer(event),
//             location: location,
//             htmlElement: undefined
//         };
//     }
//
//     private createRenderButtonConfig(location: ButtonLocation): ButtonConfig {
//         return {
//             id: `openapi-renderer`,
//             icon: 'file-scan',
//             title: 'Render Swagger UI',
//             onClick: async () => {
//                 const view = this.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView);
//                 await this.uiManager.appContext.plugin.renderOpenAPI(view!);
//             },
//             location: location,
//             htmlElement: undefined
//         };
//     }
//
//     private createRefreshButtonConfig(location: ButtonLocation): ButtonConfig {
//         return {
//             id: `openapi-refresher`,
//             icon: 'rotate-ccw',
//             title: 'Refresh Swagger UI',
//             onClick: async () => {
//                 const view = this.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView);
//                 await this.uiManager.appContext.plugin.refreshOpenAPI(view!);
//             },
//             location: location,
//             htmlElement: undefined
//         };
//     }
//
//     updateServerButtonIcon(isRunning: boolean, button: HTMLElement) {
//         const iconName = isRunning ? 'wifi' : 'wifi-off';
//         const tooltip = isRunning ? 'Toggle OpenAPI Renderer Server Off' : 'Toggle OpenAPI Renderer Server On';
//
//         button.innerHTML = '';
//         setIcon(button, iconName);
//         button.setAttribute('aria-label', tooltip);
//         button.setAttribute('data-tooltip', tooltip);
//     }
// }
//
//
//
