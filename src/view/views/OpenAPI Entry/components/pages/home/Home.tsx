import {
    Description,
    EntryContainer,
    WelcomeMessage,
} from 'view/views/OpenAPI Entry/components/pages/home/styled/styled';
import Navbar from 'view/views/OpenAPI Entry/components/navigation/navbar/navbar-component';

const Home = () => {
    return (
        <EntryContainer>
            <WelcomeMessage>OpenAPI Entry</WelcomeMessage>
            <Description>
                Start by browsing your existing files to continue working on
                your API projects.
            </Description>
        </EntryContainer>
    );
};

export default Home;
