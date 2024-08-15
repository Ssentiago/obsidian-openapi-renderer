import styled from 'styled-components';

export const DetailContainer = styled.div`
    background-color: var(--color-base-20);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    margin: 20px auto;
    color: var(--color-base-100);
    overflow: hidden;
    transition:
        max-height 0.3s ease,
        padding 0.3s ease;
    max-height: 300px;
    padding: 16px;
`;

export const DetailContainerHeader = styled.h3<{ isOpen: boolean }>`
    margin: 0;
    padding: 12px 16px;
    color: var(--color-base-100);
    cursor: pointer;
    border-radius: 4px;
    transition: box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
    font-weight: 500;
    border: 1px solid var(--color-base-20);

    &:after {
        content: '${(props) => (props.isOpen ? '▲' : '▼')}';
        margin-left: 10px;
        font-size: 0.8rem;
    }
`;

export const DetailContent = styled.div`
    padding: 10px 0;
    user-select: text;
`;
