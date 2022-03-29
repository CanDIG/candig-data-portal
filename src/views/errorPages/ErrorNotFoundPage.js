import * as React from 'react';

// material-ui
import { useTheme } from '@material-ui/styles';
import { Grid, Button } from '@material-ui/core';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Error4040 from 'assets/images/ErrorPages/Error404-0.svg';
import Error4041 from 'assets/images/ErrorPages/Error404-1.svg';
import Error4042 from 'assets/images/ErrorPages/Error404-2.svg';
import Error4043 from 'assets/images/ErrorPages/Error404-3.svg';

function ErrorNotFoundPage() {
    const theme = useTheme();

    const errorImages = [Error4040, Error4041, Error4042, Error4043];
    const index = Math.floor(Math.random() * errorImages.length);

    return (
        <MainCard title="Error 404: Page Not Found" sx={{ minHeight: '87vh' }}>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ minHeight: '100%' }}>
                <img src={errorImages[index]} alt="Error 404" width="50%" />
                <Typography variant="h4" gutterBottom component="div" m={4}>
                    Sorry, there was a problem with your request. You can redirect to the Overview page below or choose from the sidebar on
                    the left.
                </Typography>
                <Grid container direction="row" justifyContent="center" spacing="12">
                    <Grid item>
                        <Button href="/individuals-overview" variant="contained" color="primary">
                            Overview
                        </Button>
                    </Grid>
                    {/* <Grid item>
                        <Button variant="outlined" color="primary">
                            Help
                        </Button>
                    </Grid> */}
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default ErrorNotFoundPage;
