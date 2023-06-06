import { useState } from 'react';

import PropTypes from 'prop-types';

import { useSearchResultsReaderContext, useSearchResultsWriterContext } from '../SearchResultsContext';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    Tab,
    Tabs
} from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    tab: {
        minWidth: 40
    }
}));

function Sidebar(props) {
    const { cohorts, primarySites, sites, treatments, radiation } = props;
    const [selectedtab, setSelectedTab] = useState('All');
    const classes = useStyles();

    return (
        <>
            <Tabs value={selectedtab} onChange={setSelectedTab}>
                <Tab className={classes.tab} value="All" label="All" />
                <Tab className={classes.tab} value="Clinical" label="Clinical" />
                <Tab className={classes.tab} value="Genomic" label="Genomic" />
            </Tabs>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                <FormLabel>Node</FormLabel>
                <FormGroup>
                    {sites.map((site) => (
                        <FormControlLabel label={site} control={<Checkbox checked={false} />} key={site} />
                    ))}
                </FormGroup>
            </FormControl>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                <FormLabel>Cohort</FormLabel>
                <FormGroup>
                    {cohorts.map((cohort) => (
                        <FormControlLabel label={cohort} control={<Checkbox checked={false} />} key={cohort} />
                    ))}
                </FormGroup>
            </FormControl>
        </>
    );
}

Sidebar.propTypes = {
    cohorts: PropTypes.array,
    sites: PropTypes.array
};

export default Sidebar;
