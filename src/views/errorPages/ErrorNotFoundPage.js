import * as React from 'react';

// material-ui
import { useTheme } from '@material-ui/styles';
import { Grid, Button } from '@material-ui/core';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Error404 from 'assets/images/Error404.svg';

function ErrorNotFoundPage() {
    const theme = useTheme();

    return (
        <MainCard title="Error 404: Page Not Found" justifyContent="center" alignItems="center" sx={{ minHeight: 830 }}>
            <Grid container direction="column" justifyContent="center" alignItems="center" sx={{ minHeight: 200, padding: 10 }}>
                <img src={Error404} alt="Error 404" width="500" />
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
