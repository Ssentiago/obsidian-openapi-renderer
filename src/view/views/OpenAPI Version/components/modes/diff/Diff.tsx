import { Specification } from 'indexedDB/database/specification';
import { Backpack, Undo, Undo2 } from 'lucide-react';
import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { isObsidianDarkTheme } from 'view/common/helpers';
import { useSpecificationContext } from 'view/views/OpenAPI Version/components/core/context';
import {
    Container,
    DiffContainer,
    Title,
} from 'view/views/OpenAPI Version/components/modes/diff/styled/diffStyled';
import {
    Button,
    ButtonGroup,
} from 'view/views/OpenAPI Version/components/modes/styled/common-styled';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

const Diff: React.FC<{
    leftSpec: Specification;
    rightSpec: Specification;
    view: VersionView;
}> = ({ leftSpec, rightSpec, view }) => {
    const { handleBackToList } = useSpecificationContext();

    const leftDiff = leftSpec.diff as string;
    const rightDiff = rightSpec.diff as string;
    const parsedLeft = JSON.parse(leftDiff);
    const parsedRight = JSON.parse(rightDiff);

    const leftContent = JSON.stringify(parsedLeft, null, 2);
    const rightContent = JSON.stringify(parsedRight, null, 2);

    const customStyles = {
        variables: {
            light: {
                diffViewerBackground: 'var(--background-primary)',
                diffViewerColor: 'var(--text-normal)',
                addedBackground: 'rgba(var(--color-green-rgb), 0.1)',
                addedColor: 'var(--text-normal)',
                removedBackground: 'rgba(var(--color-red-rgb), 0.1)',
                removedColor: 'var(--text-normal)',
                wordAddedBackground: 'rgba(var(--color-green-rgb), 0.3)',
                wordRemovedBackground: 'rgba(var(--color-red-rgb), 0.3)',
                addedGutterBackground: 'rgba(var(--color-green-rgb), 0.2)',
                removedGutterBackground: 'rgba(var(--color-red-rgb), 0.2)',
                gutterBackground: 'var(--background-secondary)',
                gutterBackgroundDark: 'var(--background-secondary-alt)',
                highlightBackground: 'var(--text-highlight-bg)',
                highlightGutterBackground: 'var(--background-modifier-hover)',
                codeFoldGutterBackground: 'var(--background-secondary-alt)',
                codeFoldBackground: 'var(--background-modifier-form-field)',
                emptyLineBackground: 'var(--background-primary-alt)',
                gutterColor: 'var(--text-muted)',
                addedGutterColor: 'var(--text-normal)',
                removedGutterColor: 'var(--text-normal)',
                codeFoldContentColor: 'var(--text-muted)',
                diffViewerTitleBackground: 'var(--background-primary-alt)',
                diffViewerTitleColor: 'var(--text-normal)',
                diffViewerTitleBorderColor: 'var(--background-modifier-border)',
            },
            dark: {
                diffViewerBackground: 'var(--background-primary)',
                diffViewerColor: 'var(--text-normal)',
                addedBackground: 'rgba(var(--color-green-rgb), 0.15)',
                addedColor: 'var(--text-normal)',
                removedBackground: 'rgba(var(--color-red-rgb), 0.15)',
                removedColor: 'var(--text-normal)',
                wordAddedBackground: 'rgba(var(--color-green-rgb), 0.35)',
                wordRemovedBackground: 'rgba(var(--color-red-rgb), 0.35)',
                addedGutterBackground: 'rgba(var(--color-green-rgb), 0.25)',
                removedGutterBackground: 'rgba(var(--color-red-rgb), 0.25)',
                gutterBackground: 'var(--background-secondary)',
                gutterBackgroundDark: 'var(--background-secondary-alt)',
                highlightBackground: 'var(--text-highlight-bg)',
                highlightGutterBackground: 'var(--background-modifier-hover)',
                codeFoldGutterBackground: 'var(--background-secondary-alt)',
                codeFoldBackground: 'var(--background-modifier-form-field)',
                emptyLineBackground: 'var(--background-primary-alt)',
                gutterColor: 'var(--text-muted)',
                addedGutterColor: 'var(--text-normal)',
                removedGutterColor: 'var(--text-normal)',
                codeFoldContentColor: 'var(--text-muted)',
                diffViewerTitleBackground: 'var(--background-primary-alt)',
                diffViewerTitleColor: 'var(--text-normal)',
                diffViewerTitleBorderColor: 'var(--background-modifier-border)',
            },
        },
    };
    return (
        <Container>
            <div style={{ marginBottom: '20px' }}>
                <Button onClick={handleBackToList}>
                    <Undo2 />
                    Back to main
                </Button>
            </div>
            <DiffContainer>
                <ReactDiffViewer
                    oldValue={leftContent}
                    newValue={rightContent}
                    splitView={true}
                    hideLineNumbers={false}
                    showDiffOnly={true}
                    leftTitle={<Title>{leftSpec.version}</Title>}
                    rightTitle={<Title>{rightSpec.version}</Title>}
                    styles={customStyles}
                    useDarkTheme={isObsidianDarkTheme()}
                />
            </DiffContainer>
        </Container>
    );
};

export default Diff;
