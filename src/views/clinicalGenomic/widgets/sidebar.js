import { useState } from 'react';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    RadioGroup,
    Radio,
    Tab,
    Tabs,
    Autocomplete,
    TextField
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { makeStyles, useTheme } from '@mui/styles';

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
    const theme = useTheme();
    const { name, children } = props;
    const classes = useStyles();

    return (
        <FormControl className={classes.form} component="fieldset" variant="standard">
            <FormLabel
                sx={{ color: theme.palette.primary.main, background: theme.palette.primary.light, fontWeight: 'bold', paddingLeft: '1em' }}
            >
                {name}
            </FormLabel>
            <FormGroup sx={{ paddingLeft: '1em', paddingRight: '1em', paddingTop: '0.5em', paddingBottom: '0.5em' }}>{children}</FormGroup>
        </FormControl>
    );
}

function StyledCheckboxList(props) {
    const { groupName, isDonorList, remap, onWrite, options } = props;
    const [checked, setChecked] = useState({});
    const classes = useStyles();

    const HandleChange = (option, isChecked) => {
        // If we need to call some mapping function, do so
        let getID = new Promise((resolve) => resolve(option));
        if (remap) {
            getID = remap(option);
        }

        getID.then((ids) => {
            // Remove duplicates
            if (Array.isArray(ids)) {
                ids = Array.from(new Set(ids?.flat(1)));
            }

            if (isChecked) {
                setChecked((old) => ({ ...old, [option]: true }));
                // This appends ourselves to the write context under 'query': {group: [list]} or 'donorList': {group: [list]}
                onWrite((old) => {
                    if (isDonorList) {
                        return {
                            ...old,
                            donorLists: {
                                ...old.donorLists,
                                [groupName]: {
                                    ...old.donorLists?.[groupName],
                                    [option]: ids
                                }
                            }
                        };
                    }
                    return { ...old, query: { groupName: ids } };
                });
            } else {
                setChecked((old) => {
                    const { [option]: _, ...rest } = old;
                    return rest;
                });
                onWrite((old) => {
                    if (!isDonorList) {
                        const retVal = old?.query?.filter((name) => name !== groupName);
                        return { ...old, query: retVal };
                    }

                    const retVal = Object.entries(old?.donorLists?.[groupName])?.filter(([key]) => key !== option);

                    // Remove the list entirely if we are the last one
                    if (retVal.length <= 0) {
                        const { [groupName]: _, ...rest } = old?.donorLists;
                        return { ...old, donorLists: rest };
                    }

                    // Otherwise remove just our entry from the list
                    return { ...old, donorLists: { [groupName]: Object.fromEntries(retVal) } };
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
// A group of genomics data
// Keeping this separate from the rest as it's all somewhat self-contained
// NB: Should maybe go into a separate .js file
function GenomicsGroup(props) {
    const { chromosomes, genes, onWrite } = props;
    const classes = useStyles();
    // Genomic data
    const referenceGenomes = ['hg38', 'hg36'];
    const [selectedGenome, setSelectedGenome] = useState('hg38');
    const [selectedChromosomes, setSelectedChromosomes] = useState('');
    const [selectedGenes, setSelectedGenes] = useState('');
    const [startPos, setStartPos] = useState(0);
    const [endPos, setEndPos] = useState(0);

    const HandleChange = (event, changer) => {
        changer(event.target.value);
        onWrite((old) => ({
            ...old,
            genomic: { assemblyId: selectedGenome, referenceName: selectedChromosomes, start: startPos, end: endPos }
        }));
    };

    return (
        <>
            <SidebarGroup name="Reference Genome">
                <RadioGroup onChange={(event) => HandleChange(event, setSelectedGenome)} value={selectedGenome}>
                    {referenceGenomes.map((genome) => (
                        <FormControlLabel
                            label={genome}
                            control={<Radio className={classes.checkbox} />}
                            key={genome}
                            value={genome}
                            className={classes.checkboxLabel}
                        />
                    ))}
                </RadioGroup>
            </SidebarGroup>
            <SidebarGroup name="Chromosome">
                <Autocomplete
                    size="small"
                    options={chromosomes || []}
                    onChange={(event) => HandleChange(event, setSelectedChromosomes)}
                    renderInput={(params) => <TextField {...params} />}
                    value={selectedChromosomes}
                />
            </SidebarGroup>
            <SidebarGroup name="Gene Search">
                <Autocomplete
                    size="small"
                    options={genes || []}
                    onChange={(event) => HandleChange(event, setSelectedGenes)}
                    renderInput={(params) => <TextField {...params} />}
                    value={selectedGenes}
                />
            </SidebarGroup>
            <SidebarGroup name="Position">
                <TextField
                    sx={{ paddingBottom: '1em' }}
                    size="small"
                    label="Start"
                    type="number"
                    value={startPos}
                    onChange={(event) => HandleChange(event, setStartPos)}
                />
                <TextField size="small" label="End" type="number" value={endPos} onChange={(event) => HandleChange(event, setEndPos)} />
            </SidebarGroup>
        </>
    );
}

function Sidebar(props) {
    const [selectedtab, setSelectedTab] = useState('All');
    const readerContext = useSearchResultsReaderContext();
    const writerContext = useSearchQueryWriterContext();
    const classes = useStyles();

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    // Clinical data
    const [selectedCohorts, setSelectedCohorts] = useState([]);
    const [selectedTumourPrimarySites, setSelectedTumourPrimarySites] = useState([]);
    const [selectedTreatmentTypes, setSelectedTreatmentTypes] = useState([]);
    const [selectedChemotherapyDrugNames, setSelectedChemotherapyDrugNames] = useState([]);
    const [selectedImmunotherapyDrugNames, setSelectedImmunotherapyDrugNames] = useState([]);
    const [selectedHormoneTherapyDrugNames, setSelectedHormoneTherapyDrugNames] = useState([]);

    const HandleChange = (event, changer) => {
        changer(event.target.value);
        writerContext((old) => ({
            ...old,
            clinical: {
                cohorts: selectedCohorts,
                tumourPrimarySites: selectedTumourPrimarySites,
                treatmentTypes: selectedTreatmentTypes,
                chemotherapyDrugNames: selectedChemotherapyDrugNames,
                immunotherapyDrugNames: selectedImmunotherapyDrugNames,
                hormoneTherapyDrugNames: selectedHormoneTherapyDrugNames
            }
        }));
    };

    // Fill up a list of options from the results of a Katsu query
    // This includes treatment types within the dataset, etc.
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
    const chromosomes = [];
    const genes = readerContext?.genes;

    for (let i = 0; i < 23; i += 1) {
        chromosomes.push(i);
    }
    chromosomes.push('X');
    chromosomes.push('Y');
    chromosomes.push('');
    genes?.push('');

    const remap = (url, returnName) =>
        fetchFederation(url, 'katsu').then(
            (data) => data?.map((loc) => loc?.results?.results?.map((result) => result[returnName]) || []) || []
        );

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
            <GenomicsGroup chromosomes={chromosomes} genes={genes} onWrite={writerContext} />
            <SidebarGroup name="Treatment">
                <Autocomplete
                    size="small"
                    multiple
                    id="checkboxes-tags-treatment"
                    options={treatmentTypes || []}
                    disableCloseOnSelect
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                            {option}
                        </li>
                    )}
                    renderInput={(params) => <TextField {...params} label="Treatment Type" />}
                    // set width to match parent
                    sx={{ width: '100%' }}
                    onChange={(event) => HandleChange(event, setSelectedTreatmentTypes)}
                />
                {/* <Autocomplete
                    size="small"
                    options={chromosomes || []}
                    onChange={(event) => HandleChange(event, setSelectedChromosomes)}
                    renderInput={(params) => <TextField {...params} />}
                    value={selectedChromosomes}
                /> */}
                {/* <StyledCheckboxList
                    options={treatmentTypes}
                    onWrite={writerContext}
                    groupName="treatment"
                    remap={(id) => remap(`v2/authorized/treatments?treatment_type=${id}`, 'submitter_donor_id')}
                    isDonorList
                /> */}
            </SidebarGroup>
            <SidebarGroup name="Tumour Primary Site">
                <StyledCheckboxList options={tumourPrimarySites} onWrite={writerContext} groupName="primary_site" />
            </SidebarGroup>
            <SidebarGroup name="Chemotherapy">
                <StyledCheckboxList
                    options={chemotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="chemotherapy"
                    remap={(id) => remap(`v2/authorized/chemotherapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                />
            </SidebarGroup>
            <SidebarGroup name="Immunotherapy">
                <StyledCheckboxList
                    options={immunotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="immunotherapy"
                    remap={(id) => remap(`v2/authorized/immunotherapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                />
            </SidebarGroup>
            <SidebarGroup name="Hormone Therapy">
                <StyledCheckboxList
                    options={hormoneTherapyDrugNames}
                    onWrite={writerContext}
                    groupName="hormone_therapy"
                    remap={(id) => remap(`v2/authorized/hormone_therapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                />
            </SidebarGroup>
        </>
    );
}

export default Sidebar;
