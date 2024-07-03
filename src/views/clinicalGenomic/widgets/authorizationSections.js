import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function AuthorizationSections({ title }) {
    const theme = useTheme();

    return (
        <Box>
            <Box
                mt={2}
                sx={{
                    borderBottom: `1px ${theme.palette.primary.main} solid`
                }}
            >
                <Grid container justifyContent="start" alignItems="center" spacing={2}>
                    <Grid item xs={2}>
                        <Typography variant="h3">{title}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default AuthorizationSections;
