import { useState } from 'react';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    FormGroup,
    Tab,
    Tabs,
    Autocomplete,
    TextField,
    Typography
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
    },
    hidden: {
        height: 0
    }
}));

/**
 * Helper function that styles a group
 */
function SidebarGroup(props) {
    const theme = useTheme();
    const { name, children, hide } = props;
    const classes = useStyles();

    return (
        <FormControl className={`${classes.form} ${hide ? classes.hidden : ''}`} component="fieldset" variant="standard">
            {hide || (
                <FormLabel
                    sx={{
                        color: theme.palette.primary.main,
                        background: theme.palette.primary.light,
                        fontWeight: 'bold',
                        paddingLeft: '1em'
                    }}
                >
                    {name}
                </FormLabel>
            )}
            <FormGroup
                sx={{
                    paddingLeft: '1em',
                    paddingRight: '1em',
                    ...(name === 'Position' && { paddingTop: '0.5em', paddingBottom: '0.5em' })
                }}
            >
                {children}
            </FormGroup>
        </FormControl>
    );
}

function StyledCheckboxList(props) {
    const { groupName, isDonorList, remap, onWrite, options, useAutoComplete, hide } = props;
    const [checked, setChecked] = useState({});
    const classes = useStyles();

    if (hide) {
        return <></>;
    }

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
                    return { ...old, query: { [groupName]: ids } };
                });
            } else {
                setChecked((old) => {
                    const { [option]: _, ...rest } = old;
                    return rest;
                });
                onWrite((old) => {
                    if (!isDonorList) {
                        const retVal = Object.fromEntries(Object.entries(old?.query)?.filter(([name, _]) => name !== groupName));
                        return { ...old, query: retVal };
                    }

                    const retVal = Object.entries(old?.donorLists?.[groupName] || {})?.filter(([key]) => key !== option);

                    // Remove the list entirely if we are the last one
                    if (retVal.length <= 0) {
                        const { [groupName]: _, ...rest } = old?.donorLists || {};
                        return { ...old, donorLists: rest };
                    }

                    // Otherwise remove just our entry from the list
                    return { ...old, donorLists: { [groupName]: Object.fromEntries(retVal) } };
                });
            }
        });
    };

    return useAutoComplete ? (
        <Autocomplete
            size="small"
            multiple
            id="checkboxes-tags-treatment"
            options={options}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
                <li {...props} value={option}>
                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} value={option} />
                    {option}
                </li>
            )}
            renderInput={(params) => <TextField {...params} label={groupName} />}
            // set width to match parent
            sx={{ width: '100%', paddingTop: '0.5em', paddingBottom: '0.5em' }}
            onChange={(_, __, reason, details) => {
                HandleChange(details.option, reason === 'selectOption');
            }}
        />
    ) : (
        options?.map((option) => (
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
        ))
    );
}
// A group of genomics data
// Keeping this separate from the rest as it's all somewhat self-contained
// NB: Should maybe go into a separate .js file
function GenomicsGroup(props) {
    const { chromosomes, genes, onWrite, hide } = props;
    const classes = useStyles();
    // Genomic data
    const referenceGenomes = ['hg38'];
    const [selectedGenome, setSelectedGenome] = useState('hg38');
    const [selectedChromosomes, setSelectedChromosomes] = useState('');
    const [selectedGenes, setSelectedGenes] = useState('');
    const [startPos, setStartPos] = useState(0);
    const [endPos, setEndPos] = useState(0);

    if (hide) {
        return <></>;
    }

    const HandleChange = (value, changer, toChange) => {
        changer(value);
        onWrite((old) => ({
            ...old,
            genomic: {
                assemblyId: selectedGenome,
                referenceName: selectedChromosomes,
                start: startPos,
                end: endPos,
                gene: selectedGenes,
                [toChange]: value
            }
        }));
    };

    return (
        <>
            {/* <SidebarGroup name="Reference Genome">
                <RadioGroup onChange={(event) => HandleChange(event.target.value, setSelectedGenome)} value={selectedGenome}>
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
            </SidebarGroup> */}
            <SidebarGroup name="Gene Search">
                {selectedChromosomes && <Typography sx={{ paddingTop: '0.5em' }}>(Disabled during position search)</Typography>}
                <Autocomplete
                    size="small"
                    options={genes || []}
                    onChange={(_, value) => HandleChange(value, setSelectedGenes, 'gene')}
                    renderInput={(params) => <TextField {...params} />}
                    value={selectedGenes}
                    style={{ paddingTop: '0.5em', paddingBottom: '0.5em' }}
                    disabled={!!selectedChromosomes}
                />
            </SidebarGroup>
            <SidebarGroup name="Position">
                {selectedGenes && <Typography sx={{ paddingTop: '0.5em' }}>(Disabled during gene search)</Typography>}
                <Autocomplete
                    size="small"
                    options={chromosomes || []}
                    onChange={(_, value) => HandleChange(value, setSelectedChromosomes, 'referenceName')}
                    renderInput={(params) => <TextField label="Chromosome" {...params} />}
                    value={selectedChromosomes}
                    style={{ paddingTop: '0.5em', paddingBottom: '1em' }}
                    disabled={!!selectedGenes}
                />
                <TextField
                    sx={{ paddingBottom: '1em' }}
                    size="small"
                    label="Start"
                    type="number"
                    value={startPos}
                    onChange={(event) => HandleChange(event.target.value, setStartPos, 'start')}
                    style={{ paddingTop: '0.5em', paddingBottom: '1em' }}
                    disabled={!!selectedGenes}
                />
                <TextField
                    size="small"
                    label="End"
                    type="number"
                    value={endPos}
                    onChange={(event) => HandleChange(event.target.value, setEndPos, 'end')}
                    style={{ paddingTop: '0.5em', paddingBottom: '0.5em' }}
                    disabled={!!selectedGenes}
                />
            </SidebarGroup>
        </>
    );
}

function Sidebar(props) {
    const [selectedtab, setSelectedTab] = useState('All');
    const readerContext = useSearchResultsReaderContext();
    const writerContext = useSearchQueryWriterContext();
    const classes = useStyles();

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
        chromosomes.push(`${i}`);
    }
    chromosomes.push('X');
    chromosomes.push('Y');
    chromosomes.push('');
    genes?.push('');

    const hideGenomic = selectedtab !== 'All' && selectedtab !== 'Genomic';
    const hideClinical = selectedtab !== 'All' && selectedtab !== 'Clinical';

    const remap = (url, returnName) =>
        fetchFederation(url, 'katsu').then(
            (data) => data?.map((loc) => loc?.results?.results?.map((result) => result[returnName]) || []) || []
        );

    return (
        <>
            <Tabs value={selectedtab} onChange={(_, value) => setSelectedTab(value)}>
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
            <GenomicsGroup chromosomes={chromosomes} genes={genes} onWrite={writerContext} hide={hideGenomic} />
            <SidebarGroup name="Treatment" hide={hideClinical}>
                <StyledCheckboxList
                    options={treatmentTypes}
                    onWrite={writerContext}
                    groupName="treatment"
                    remap={(id) => remap(`v2/authorized/treatments?treatment_type=${id}`, 'submitter_donor_id')}
                    isDonorList
                    useAutoComplete={treatmentTypes.length >= 10}
                    hide={hideClinical}
                />
            </SidebarGroup>
            <SidebarGroup name="Tumour Primary Site" hide={hideClinical}>
                <StyledCheckboxList
                    options={tumourPrimarySites}
                    onWrite={writerContext}
                    groupName="primary_site"
                    useAutoComplete={tumourPrimarySites.length >= 10}
                    hide={hideClinical}
                />
            </SidebarGroup>
            <SidebarGroup name="Chemotherapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={chemotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="chemotherapy"
                    remap={(id) => remap(`v2/authorized/chemotherapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                    useAutoComplete={chemotherapyDrugNames.length >= 10}
                    hide={hideClinical}
                />
            </SidebarGroup>
            <SidebarGroup name="Immunotherapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={immunotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="immunotherapy"
                    remap={(id) => remap(`v2/authorized/immunotherapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                    useAutoComplete={immunotherapyDrugNames.length >= 10}
                    hide={hideClinical}
                />
            </SidebarGroup>
            <SidebarGroup name="Hormone Therapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={hormoneTherapyDrugNames}
                    onWrite={writerContext}
                    groupName="hormone_therapy"
                    remap={(id) => remap(`v2/authorized/hormone_therapies?drug_name=${id}`, 'submitter_donor_id')}
                    isDonorList
                    useAutoComplete={hormoneTherapyDrugNames.length >= 10}
                    hide={hideClinical}
                />
            </SidebarGroup>
        </>
    );
}

export default Sidebar;
