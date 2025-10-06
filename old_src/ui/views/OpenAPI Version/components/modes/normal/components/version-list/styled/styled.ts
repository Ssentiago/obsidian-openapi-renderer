import styled from 'styled-components';

export const GroupTitle = styled.h3<{ $isOpen: boolean }>`
    font-size: 1.2rem;
    margin: 20px 0 10px;
    color: var(--text-normal);
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 5px;
    cursor: pointer;

    &:after {
        content: '${(props) => (props.$isOpen ? '▲' : '▼')}';
        margin-left: 10px;
        font-size: 0.8rem;
    }
`;

export const Details = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
export const Version = styled.span`
    font-size: 0.9rem;
`;

export const CreatedAt = styled.span`
    font-size: 0.9rem;
`;
