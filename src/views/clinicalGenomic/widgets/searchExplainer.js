import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, Typography } from '@mui/material';
import { useSearchQueryReaderContext } from '../SearchResultsContext';

const PREFIX = 'SearchExplainer';

const Root = styled('div')(({ theme }) => ({
    marginLeft: '0.5em',
    marginRight: '0.5em',
    [`& .${PREFIX}-divider`]: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    },
    [`& .${PREFIX}-header`]: {
        textAlign: 'center'
    },
    [`& .${PREFIX}-spacing`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
}));

function SearchExplainer() {
    const query = useSearchQueryReaderContext().query;

    // Decompose the query into its roots: what are we searching on?

    return (
        <Root>
            {/* Header */}
            <Box sx={{ border: 1, borderRadius: 2, borderColor: 'white' }}>
                asdf adsjfa hsdfklahs djlhaldksjf haldjsfh lkjadhsf jklahdf lasdjlfj alksjdfk lajsdfkl
            </Box>
        </Root>
    );
}

export default SearchExplainer;
