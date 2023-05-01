import { useEffect, useState } from 'react';

import { useSearchResultsReaderContext } from '../SearchResultsContext';

import {
    Tab,
    Tabs
} from "@mui/material";

function Sidebar(props) {
    const [selectedtab, setSelectedTab] = useState();
    const resultsContext = useSearchResultsReaderContext();
    console.log(resultsContext);
    //const resultsContext = {sites: ["BCGSC", "UHN"]};

    return <Tabs value={selectedtab} onChange={setSelectedTab}>
        <Tab label="All" />
        <Tab label="Clinical" />
        <Tab label="Genomic" />
    </Tabs>
}

export default DataVisualization;

