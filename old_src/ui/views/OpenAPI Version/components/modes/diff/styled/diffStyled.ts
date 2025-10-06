import styled from 'styled-components';

export const Title = styled.h2`
    margin: 0;
    padding: 10px;
`;

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 15px;
    box-sizing: border-box;
`;
export const TopContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: calc(50% - 15px);
    margin-bottom: 15px;
`;
export const Pane = styled.div`
    flex: 1;
    padding: 20px;
    overflow: auto;
`;
export const LeftPane = styled(Pane)``;

export const RightPane = styled(Pane)`
    padding-left: 20px;
`;

export const BottomPane = styled.div`
    height: calc(50% - 15px);
    padding: 20px;
    overflow: auto;
`;

export const DiffContainer = styled.div`
    height: 100%;
    overflow: auto;
`;

export const DiffControls = styled.div`
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
`;
