import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// routing
import Routes from './routes';

// defaultTheme
import themes from './themes';

// project imports
import NavigationScroll from './layout/NavigationScroll';

// ===========================|| APP ||=========================== //

function App() {
    const customization = useSelector((state) => state.customization);

    return (
        <ThemeProvider theme={themes(customization)}>
            <StyledEngineProvider injectFirst>
                <CssBaseline />
                <NavigationScroll>
                    <Routes />
                </NavigationScroll>
            </StyledEngineProvider>
        </ThemeProvider>
    );
}

export default App;
