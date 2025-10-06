import styled, { css, keyframes } from 'styled-components';
import { ButtonState } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/typing/constants';

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(10px);
  }
`;

export const AnimatedFileListItem = styled.div<{ inProp: boolean }>`
    animation: ${(props) => (props.inProp ? fadeIn : fadeOut)} 0.3s ease-out;
`;

export const TemplateSelector = styled.select`
    border: 1px solid var(--color-base-20);
    border-radius: 5px;
    margin: 10px 0;
    box-shadow: 0 4px 12px var(--background-modifier-box-shadow);
    text-transform: uppercase;
    font-size: 14px;

    &:hover {
        background-color: var(--color-base-10);
        cursor: pointer;
    }
`;

const pulse = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.9; }
    100% { transform: scale(1); opacity: 1; }
`;

const rotateWithScale = keyframes`
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
`;

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

export const AnimateButton = styled.button<{ state: ButtonState }>`
    svg {
        ${({ state }) =>
            state === 'null' &&
            css`
                animation: ${pulse} 1.5s ease-in-out infinite;
            `}

        ${({ state }) =>
            state === 'loading' &&
            css`
                animation: ${rotateWithScale} 3s linear infinite;
            `}

        ${({ state }) =>
            state === 'error' &&
            css`
                animation: ${shake} 0.5s ease-in-out;
            `}

        ${({ state }) =>
            state === 'success' &&
            css`
                animation: ${blink} 1s ease-in-out 3;
            `}
    }
`;
