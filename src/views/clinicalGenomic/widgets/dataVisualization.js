import { useEffect, useState } from 'react';

import { useSearchResultsReaderContext } from '../SearchResultsContext';

import { Box, Typography } from '@mui/material';

function DataVisualization(props) {
    const resultsContext = useSearchResultsReaderContext();
    //const resultsContext = {sites: ["BCGSC", "UHN"]};

    return (
        <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2, boxShadow: 2 }}>
            <Typography>Data Visualization</Typography>
        </Box>
    );
}

export default DataVisualization;
