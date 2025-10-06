import { CircleDot, Download } from 'lucide-react';
import React, { useState } from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import FileManager from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/FileManager';
import {
    BackButton,
    FileManagerWrapper,
    OverviewContainer,
    QuickActionsContainer,
    Text,
    Title,
} from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/styled/styled';

/**
 * A view that displays a file manager and quick actions.
 *
 * It will display a file manager when the user clicks on the "Open file manager"
 * button. The file manager will display all the specifications in the vault,
 * and the user will be able to select a specification to open in the file
 * editor.
 *
 * It will also display a button to export all the specifications as a zip
 * file with HTML files.
 *
 * @returns {ReactElement} The view.
 */
const Overview: React.FC = () => {
    const { view } = useEntryContext();

    const [openFileManager, setOpenFileManager] = useState(false);

    return (
        <OverviewContainer>
            {openFileManager ? (
                <FileManagerWrapper>
                    <BackButton onClick={() => setOpenFileManager(false)}>
                        Back to quick actions
                    </BackButton>
                    <FileManager />
                </FileManagerWrapper>
            ) : (
                <QuickActionsContainer>
                    <Title>Quick actions</Title>
                    <Text
                        onClick={() => setOpenFileManager(true)}
                        aria-label={
                            'Open file manager to manage specifications'
                        }
                    >
                        Open file manager
                        <CircleDot />
                    </Text>
                    <Text
                        onClick={() => view.controller.exportAllData()}
                        aria-label={
                            'Export all the specs as a zip file with HTML files'
                        }
                    >
                        Export all the specs
                        <Download />
                    </Text>
                </QuickActionsContainer>
            )}
        </OverviewContainer>
    );
};

export default Overview;
