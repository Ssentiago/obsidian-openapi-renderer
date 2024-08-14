import { App, Modal, Notice, Setting } from 'obsidian';

export interface FormData {
    priority?: string;
    status?: string;
    changeType?: string;
    description?: string;
    tags?: string;
    specName?: string;
    specVersion?: string;
}

function getBaseFormData() {
    return {
        priority: undefined,
        status: undefined,
        changeType: undefined,
        description: undefined,
        tags: undefined,
        specName: undefined,
        specVersion: undefined,
    };
}

export class SaveCurrentVersionModal extends Modal {
    formData: FormData = getBaseFormData();
    private submitted!: boolean;

    constructor(app: App) {
        super(app);
        this.titleEl.textContent = 'Save current version';
    }

    async onOpen() {
        const { contentEl } = this;

        new Setting(contentEl)
            .setName('Version Name')
            .setDesc(
                'Please provide a name for the new version of your specification.'
            )
            .addText((input) => {
                input.onChange((value) => {
                    input.setValue(value);
                    this.formData.specName = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'This name should clearly describe the purpose or nature of the specification version.'
                    )
            )
            .setClass('required-field');

        new Setting(contentEl)
            .setName('Version Number')
            .setDesc('Enter a version number for this specification.')
            .addText((input) => {
                input.onChange((value) => {
                    this.formData.specVersion = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'Version number should follow semantic versioning format (e.g., 1.0.0). Ensure the new version number is greater than the current highest version of this specification.'
                    )
            )
            .setClass('newlines')
            .setClass('required-field');

        new Setting(contentEl)
            .setName('Tags')
            .setDesc(
                'Tags associated with this version for easier searching and filtering.'
            )
            .addText((input) => {
                input.onChange((value) => {
                    this.formData.tags = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'Tags can help categorize and find this version more easily.'
                    )
            );

        new Setting(contentEl)
            .setName('Description')
            .setDesc('Describe the changes made in this version.')
            .addTextArea((input) => {
                input.onChange((value) => {
                    this.formData.description = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'Provide a summary of the changes and improvements in this version.'
                    )
            );

        new Setting(contentEl)
            .setName('Change Type')
            .setDesc(
                'Specify the type of changes made, e.g., addition, removal, fix.'
            )
            .addDropdown((dropdown) => {
                dropdown.addOption('addition', 'Addition');
                dropdown.addOption('removal', 'Removal');
                dropdown.addOption('fix', 'Fix');
                dropdown.addOption('update', 'Update');
                dropdown.onChange((value) => {
                    this.formData.changeType = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'Select the type of changes made in this version.'
                    )
            );

        new Setting(contentEl)
            .setName('Status')
            .setDesc(
                'Specify the status of this version, e.g., draft, published, testing.'
            )
            .addDropdown((dropdown) => {
                dropdown.addOption('draft', 'Draft');
                dropdown.addOption('published', 'Published');
                dropdown.addOption('testing', 'Testing');
                dropdown.onChange((value) => {
                    this.formData.status = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip('Select the current status of this version.')
            );

        new Setting(contentEl)
            .setName('Priority')
            .setDesc('Select the priority of changes in this version.')
            .addDropdown((dropdown) => {
                dropdown.addOption('low', 'Low');
                dropdown.addOption('medium', 'Medium');
                dropdown.addOption('high', 'High');
                dropdown.onChange((value) => {
                    this.formData.priority = value;
                });
            })
            .addExtraButton((button) =>
                button
                    .setIcon('info')
                    .setTooltip(
                        'Choose the priority level for the changes in this version.'
                    )
            );

        new Setting(contentEl).addButton((button) => {
            button.setButtonText('Save').onClick(() => {
                console.log(this.formData);
                if (
                    this.formData.specVersion === undefined ||
                    this.formData.specName === undefined
                ) {
                    new Notice('Please fill in all required fields.');
                    this.submitted = false;
                    return;
                }

                if (!this.formData.specVersion.match(/\d+\.\d+\.\d+/g)) {
                    new Notice(
                        "'Version should follow the Semantic Versioning format (MAJOR.MINOR.PATCH). Example: 1.0.0"
                    );
                    return;
                }
                this.submitted = true;
                this.close();
            });
        });
    }

    onClose(): void {
        if (!this.submitted) {
            this.formData = getBaseFormData();
        }
        this.contentEl.empty();
        super.onClose();
    }
}
