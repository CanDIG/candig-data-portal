import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import Routes from './routes';

// defaultTheme
import themes from './themes';

// project imports
import NavigationScroll from './layout/NavigationScroll';
import AuthCheck from 'views/pages/authentication/AuthCheck';

// ===========================|| APP ||=========================== //

function App() {
    const customization = useSelector((state) => state.customization);

    return (
        <ThemeProvider theme={themes(customization)}>
            <StyledEngineProvider injectFirst>
                <CssBaseline />
                <NavigationScroll>
                    <AuthCheck>
                        <Routes />
                    </AuthCheck>
                </NavigationScroll>
            </StyledEngineProvider>
        </ThemeProvider>
    );
}

export default App;
