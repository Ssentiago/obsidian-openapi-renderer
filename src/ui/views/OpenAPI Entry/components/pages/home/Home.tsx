import {
    Description,
    EntryContainer,
    WelcomeMessage,
} from 'ui/views/OpenAPI Entry/components/pages/home/styled/styled';
import Navbar from 'ui/views/OpenAPI Entry/components/navigation/navbar/navbar-component';

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
