import {
    CircleCheck,
    Loader,
    LucideMessageCircleQuestion,
    X,
} from 'lucide-react';
import React from 'react';
import { AnimateButton } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/styled/styled';
import { ButtonState } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/typing/constants';

const HelperButton: React.FC<{ state: ButtonState; onClick: () => void }> = ({
    state,
    onClick,
}) => {
    const getIcon = () => {
        switch (state) {
            case ButtonState.Null:
                return <LucideMessageCircleQuestion />;
            case ButtonState.Loading:
                return <Loader />;
            case ButtonState.Error:
                return <X />;
            case ButtonState.Success:
                return <CircleCheck />;
        }
    };

    const getLabelButton = () => {
        switch (state) {
            case ButtonState.Null:
                return 'Click to open modal and enter url';
            case ButtonState.Loading:
                return 'Loading data...';
            case ButtonState.Error:
                return 'Error fetching data from url';
            case ButtonState.Success:
                return 'Data fetched successfully';
        }
    };

    return (
        <AnimateButton
            aria-label={getLabelButton()}
            state={state}
            onClick={onClick}
        >
            {getIcon()}
        </AnimateButton>
    );
};

export default HelperButton;
