import { useState } from 'react';

import PropTypes from 'prop-types';

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
import { TreeView } from '@mui/lab';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import { makeStyles } from '@mui/styles';

import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';
import { fetchFederation } from '../../../store/api';

const useStyles = makeStyles((theme) => ({
    tab: {
        minWidth: 40
    },
    checkbox: {
        paddingTop: 0,
        paddingBottom: 0
    },
    form: {
        width: '100%'
    },
    checkboxLabel: {
        textTransform: 'capitalize'
    }
}));

/**
 * Helper function that styles a group
 */
function SidebarGroup(props) {
    const { name, children } = props;
    const classes = useStyles();

    return (
        <FormControl className={classes.form} component="fieldset" variant="standard">
            <FormLabel>{name}</FormLabel>
            <FormGroup>{children}</FormGroup>
        </FormControl>
    );
}

function StyledCheckboxList(props) {
    const { groupName, remap, onWrite, options } = props;
    const [checked, setChecked] = useState({});
    const classes = useStyles();

    const HandleChange = (option, isChecked) => {
        // If we need to call some mapping function, do so
        let getID = new Promise((resolve) => resolve(option));
        if (remap) {
            getID = remap(option);
        }

        getID.then((id) => {
            if (isChecked) {
                setChecked((old) => ({ ...old, [option]: true }));
                onWrite((old) => ({ ...old, [groupName]: [...(old?.[groupName] || []), id] }));
            } else {
                setChecked((old) => {
                    const { [option]: _, ...rest } = old;
                    return rest;
                });
                onWrite((old) => {
                    const retVal = old?.[groupName]?.filter((name) => name !== id);
                    // Remove the list entirely if we are the last one
                    if (retVal.length <= 0) {
                        const { [groupName]: _, ...rest } = old;
                        return rest;
                    }

                    // Otherwise remove our entry from the list
                    return { ...old, [groupName]: retVal };
                });
            }
        });
    };

    return options?.map((option) => (
        <FormControlLabel
            label={option}
            control={
                <Checkbox
                    className={classes.checkbox}
                    checked={option in checked}
                    onChange={(event) => HandleChange(option, event.target.checked)}
                />
            }
            key={option}
            className={classes.checkboxLabel}
        />
    ));
}

function Sidebar(props) {
    const [selectedtab, setSelectedTab] = useState('All');
    const readerContext = useSearchResultsReaderContext();
    const writerContext = useSearchQueryWriterContext();
    const classes = useStyles();

    const ExtractSidebarElements = (key) => {
        const allResults = readerContext?.sidebar?.map((loc) => loc?.results?.[key] || [])?.flat(1) || [];

        // Remove duplicates before returning using Set
        return [...new Set(allResults)];
    };

    // Parse out what we need:
    const sites = readerContext?.programs?.map((loc) => loc.location.name) || [];
    const cohorts = readerContext?.programs?.map((loc) => loc.results.results.map((cohort) => cohort.program_id)).flat(1) || [];
    const treatmentTypes = ExtractSidebarElements('treatment_types');
    const tumourPrimarySites = ExtractSidebarElements('tumour_primary_sites');
    const chemotherapyDrugNames = ExtractSidebarElements('chemotherapy_drug_names');
    const immunotherapyDrugNames = ExtractSidebarElements('immunotherapy_drug_names');
    const hormoneTherapyDrugNames = ExtractSidebarElements('hormone_therapy_drug_names');

    const remap = (url, returnName) => fetchFederation(url, 'katsu').then((data) => data?.[0]?.results?.results?.[0]?.[returnName]);

    return (
        <>
            <Tabs value={selectedtab} onChange={setSelectedTab}>
                <Tab className={classes.tab} value="All" label="All" />
                <Tab className={classes.tab} value="Clinical" label="Clinical" />
                <Tab className={classes.tab} value="Genomic" label="Genomic" />
            </Tabs>
            <SidebarGroup name="Node">
                <StyledCheckboxList options={sites} onWrite={writerContext} groupName="node" />
            </SidebarGroup>
            <SidebarGroup name="Cohort">
                <StyledCheckboxList options={cohorts} onWrite={writerContext} groupName="program_id" />
            </SidebarGroup>
            <SidebarGroup name="Treatment">
                <StyledCheckboxList
                    options={treatmentTypes}
                    onWrite={writerContext}
                    groupName="treatment"
                    remap={(id) => remap(`v2/authorized/treatments?treatment_type=${id}`, 'submitter_treatment_id')}
                />
            </SidebarGroup>
            <SidebarGroup name="Tumour Primary Site">
                <StyledCheckboxList options={tumourPrimarySites} onWrite={writerContext} groupName="primary_site" />
            </SidebarGroup>
            <SidebarGroup name="Chemotherapy">
                <StyledCheckboxList
                    options={chemotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="chemotherapy"
                    remap={(id) => remap(`v2/authorized/chemotherapies?drug_name=${id}`, 'id')}
                />
            </SidebarGroup>
            <SidebarGroup name="Immunotherapy">
                <StyledCheckboxList
                    options={immunotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="immunotherapy"
                    remap={(id) => remap(`v2/authorized/immunotherapies?drug_name=${id}`, 'id')}
                />
            </SidebarGroup>
            <SidebarGroup name="Hormone Therapy">
                <StyledCheckboxList
                    options={hormoneTherapyDrugNames}
                    onWrite={writerContext}
                    groupName="hormone_therapy"
                    remap={(id) => remap(`v2/authorized/hormone_therapies?drug_name=${id}`, 'id')}
                />
            </SidebarGroup>
        </>
    );
}

export default Sidebar;
