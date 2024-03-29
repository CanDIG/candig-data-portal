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
    Typography,
    Button
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTheme } from '@mui/system';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';

const PREFIX = 'Sidebar';

const classes = {
    tab: `${PREFIX}-tab`,
    checkbox: `${PREFIX}-checkbox`,
    form: `${PREFIX}-form`,
    checkboxLabel: `${PREFIX}-checkboxLabel`,
    hidden: `${PREFIX}-hidden`,
    button: `${PREFIX}-button`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.tab}`]: {
        minWidth: 40
    },
    [`& .${classes.checkbox}`]: {
        paddingTop: 0,
        paddingBottom: 0
    },
    [`& .${classes.form}`]: {
        width: '100%'
    },
    [`& .${classes.checkboxLabel}`]: {
        textTransform: 'capitalize'
    },
    [`& .${classes.hidden}`]: {
        height: 0
    },
    [`& .${classes.button}`]: {
        margin: '0.5em',
        paddingRight: '1em',
        paddingLeft: '1em',
        background: 'white',
        color: theme.palette.primary.main,
        borderRadius: '25px',
        border: `1px solid ${theme.palette.primary.main}`,
        height: '1.5em',
        width: '90%',
        boxShadow: `0px 2px 4px rgba(0, 0, 0, 0.2)`
    }
}));

/**
 * Helper function that styles a group
 */
function SidebarGroup(props) {
    const theme = useTheme();
    const { name, children, hide } = props;

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

SidebarGroup.propTypes = {
    name: PropTypes.string,
    children: PropTypes.node,
    hide: PropTypes.bool
};

function StyledCheckboxList(props) {
    const { isExclusion, groupName, isFilterList, onWrite, options, useAutoComplete, hide, checked, setChecked } = props;
    const [initialized, setInitialized] = useState(false);

    if (hide) {
        return null;
    }

    // Check all of our options by default
    if (!initialized && isFilterList && options.length) {
        const optionsObject = {};
        options.forEach((option) => {
            optionsObject[option] = true;
        });
        setInitialized(true);
        setChecked(optionsObject);
    }

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const HandleChange = (ids, isChecked) => {
        // Remove duplicates
        if (Array.isArray(ids)) {
            ids = Array.from(new Set(ids?.flat(1)));
        }

        if (isExclusion ? !isChecked : isChecked) {
            if (useAutoComplete) {
                // Autcomplete's onChange will have IDs be a list of options that are checked
                setChecked((_) => {
                    const retVal = {};
                    ids.forEach((id) => {
                        retVal[id] = true;
                    });
                    return retVal;
                });
            } else {
                // FormControlLabel's onChange will have IDs be a list of IDs that have _changed_
                setChecked((old) => ({ ...old, [ids]: true }));
            }
            onWrite((old) => {
                const retVal = { donorLists: {}, filter: {}, query: {}, ...old };

                // The following appends ourselves to the write context under 'query': {group: [list]} or 'donorList': {group: [list]}
                if (isFilterList) {
                    // Filter lists operate differently: you _remove_ the option when you check it
                    retVal.filter[groupName].splice(retVal.filter[groupName].indexOf(ids));
                } else {
                    retVal.query[groupName] = ids;
                }
                return retVal;
            });
        } else {
            setChecked((old) => {
                // Autocomplete's onChange will return a list
                if (useAutoComplete) {
                    const retVal = {};
                    ids.forEach((id) => {
                        retVal[id] = true;
                    });
                    return retVal;
                }

                // FormControlLabel's onChange
                const { [ids]: _, ...rest } = old;
                return rest;
            });
            onWrite((old) => {
                const retVal = { filter: {}, ...old };
                if (isFilterList) {
                    if (groupName in retVal.filter) {
                        retVal.filter[groupName].push(ids);
                    } else {
                        retVal.filter[groupName] = [ids];
                    }
                    return retVal;
                }

                const newList = Object.fromEntries(Object.entries(old.query).filter(([name, _]) => name !== groupName));
                retVal.query = newList;
                return retVal;
            });
        }
    };

    const checkedList = Object.keys(checked);

    return useAutoComplete ? (
        <Autocomplete
            size="small"
            multiple
            id={`checkboxes-tags-${groupName}`}
            options={options}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
                <li {...props} value={option}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={isExclusion ? !selected : selected}
                        value={option}
                    />
                    {option}
                </li>
            )}
            renderInput={(params) => <TextField {...params} label={groupName} />}
            // set width to match parent
            sx={{ width: '100%', paddingTop: '0.5em', paddingBottom: '0.5em' }}
            onChange={(_, value, reason) => {
                HandleChange(value, reason === 'selectOption');
            }}
            value={checkedList}
        />
    ) : (
        options?.map((option) => (
            <FormControlLabel
                label={option}
                control={
                    <Checkbox
                        className={classes.checkbox}
                        checked={isExclusion ? !(option in checked) : option in checked}
                        onChange={(event) => HandleChange(option, event.target.checked)}
                    />
                }
                key={option}
                className={classes.checkboxLabel}
            />
        ))
    );
}

StyledCheckboxList.propTypes = {
    isExclusion: PropTypes.bool,
    groupName: PropTypes.string,
    hide: PropTypes.bool,
    isDonorList: PropTypes.bool,
    isFilterList: PropTypes.bool,
    remap: PropTypes.func,
    onWrite: PropTypes.func,
    options: PropTypes.array,
    useAutoComplete: PropTypes.bool,
    setChecked: PropTypes.func,
    checked: PropTypes.object
};

// A group of genomics data
// Keeping this separate from the rest as it's all somewhat self-contained
// NB: Should maybe go into a separate .js file
function GenomicsGroup(props) {
    const {
        chromosomes,
        genes,
        onWrite,
        hide,
        selectedChromosomes,
        selectedGenes,
        startPos,
        endPos,
        setSelectedChromosomes,
        setSelectedGenes,
        setStartPos,
        setEndPos
    } = props;

    const [selectedGenome, _setSelectedGenome] = useState('hg38');
    const [_timeout, setNewTimeout] = useState(null);

    if (hide) {
        return null;
    }

    const HandleChange = (value, changer, toChange) => {
        setNewTimeout((oldTimeout) => {
            if (oldTimeout != null) {
                clearTimeout(oldTimeout);
            }

            return setTimeout(() => {
                const newQuery = {
                    referenceName: selectedChromosomes,
                    gene: selectedGenes,
                    start: startPos,
                    end: endPos,
                    assembly: selectedGenome,
                    [toChange]: value
                };

                onWrite((old) => ({
                    ...old,
                    query: {
                        ...old.query,
                        chrom: newQuery.referenceName ? `chr${newQuery.referenceName}:${newQuery.start}-${newQuery.end}` : undefined,
                        gene: newQuery.gene || undefined,
                        assembly: newQuery.assembly
                    }
                }));
            }, 1000);
        });
        changer(value);
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

GenomicsGroup.propTypes = {
    chromosomes: PropTypes.array,
    genes: PropTypes.array,
    hide: PropTypes.bool,
    onWrite: PropTypes.func,
    endPos: PropTypes.string,
    setEndPos: PropTypes.func,
    startPos: PropTypes.string,
    setStartPos: PropTypes.func,
    selectedGenes: PropTypes.string,
    setSelectedGenes: PropTypes.func,
    selectedChromosomes: PropTypes.string,
    setSelectedChromosomes: PropTypes.func
};

function Sidebar() {
    const [selectedtab, setSelectedTab] = useState('All');
    const readerContext = useSearchResultsReaderContext();
    const writerContext = useSearchQueryWriterContext();

    // Genomic data
    // const referenceGenomes = ['hg38'];
    const [selectedChromosomes, setSelectedChromosomes] = useState('');
    const [selectedGenes, setSelectedGenes] = useState('');
    const [startPos, setStartPos] = useState(0);
    const [endPos, setEndPos] = useState(0);

    // Clinical Data
    const [selectedNodes, setSelectedNodes] = useState({});
    const [selectedCohorts, setSelectedCohorts] = useState({});
    const [selectedTreatment, setSelectedTreatment] = useState({});
    const [selectedPrimarySite, setSelectedPrimarySite] = useState({});
    const [selectedChemotherapy, setSelectedChemotherapy] = useState({});
    const [selectedImmunotherapy, setSelectedImmunotherapy] = useState({});
    const [selectedHormoneTherapy, setSelectedHormoneTherapy] = useState({});

    function resetButton() {
        // Reset state variables for checkboxes and dropdowns
        const locations = readerContext?.programs?.map((loc) => loc.location.name);

        if (locations) {
            const selectedNodes = locations.reduce((acc, loc) => {
                acc[loc] = true;
                return acc;
            }, {});

            setSelectedNodes(selectedNodes);
        }
        setSelectedCohorts([readerContext?.programs?.map((loc) => loc?.results?.items.map((cohort) => cohort.program_id)).flat(1) || []]);

        // Genomic
        setSelectedGenes('');
        setSelectedChromosomes('');
        setStartPos(0);
        setEndPos(0);

        // Clinical
        setSelectedTreatment({});
        setSelectedPrimarySite({});
        setSelectedChemotherapy({});
        setSelectedImmunotherapy({});
        setSelectedHormoneTherapy({});

        // Set context writer to include only nodes and cohorts
        writerContext({
            // Set nodes and cohorts in the filter
            filter: {
                node: [readerContext?.programs?.map((loc) => loc.location.name) || []], // Set your default nodes
                exclude_cohorts: [
                    readerContext?.programs?.map((loc) => loc?.results?.items.map((cohort) => cohort.program_id)).flat(1) || []
                ], // Set cohorts to empty array or whichever default value you want
                query: {}
            }
        });
    }

    // Fill up a list of options from the results of a Katsu query
    // This includes treatment types within the dataset, etc.
    const ExtractSidebarElements = (key) => {
        const allResults = readerContext?.sidebar?.map((loc) => loc?.results?.[key] || [])?.flat(1) || [];

        // Remove duplicates before returning using Set
        return [...new Set(allResults)];
    };

    // Parse out what we need:
    const sites = readerContext?.programs?.map((loc) => loc.location.name) || [];
    const cohorts = readerContext?.programs?.map((loc) => loc?.results?.items.map((cohort) => cohort.program_id)).flat(1) || [];
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

    return (
        <Root>
            <Tabs value={selectedtab} onChange={(_, value) => setSelectedTab(value)}>
                <Tab className={classes.tab} value="All" label="All" />
                <Tab className={classes.tab} value="Clinical" label="Clinical" />
                <Tab className={classes.tab} value="Genomic" label="Genomic" />
            </Tabs>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button className={classes.button} onClick={() => resetButton()}>
                    Reset Filters
                </Button>
            </div>
            <SidebarGroup name="Node">
                <StyledCheckboxList
                    options={sites}
                    onWrite={writerContext}
                    groupName="node"
                    isFilterList
                    checked={selectedNodes}
                    setChecked={setSelectedNodes}
                />
            </SidebarGroup>
            <SidebarGroup name="Cohort">
                <StyledCheckboxList
                    options={cohorts}
                    onWrite={writerContext}
                    groupName="exclude_cohorts"
                    isExclusion
                    checked={selectedCohorts}
                    setChecked={setSelectedCohorts}
                />
            </SidebarGroup>
            <GenomicsGroup
                chromosomes={chromosomes}
                genes={genes}
                onWrite={writerContext}
                hide={hideGenomic}
                selectedChromosomes={selectedChromosomes}
                selectedGenes={selectedGenes}
                startPos={startPos}
                endPos={endPos}
                setSelectedChromosomes={setSelectedChromosomes}
                setSelectedGenes={setSelectedGenes}
                setStartPos={setStartPos}
                setEndPos={setEndPos}
            />
            <SidebarGroup name="Treatment" hide={hideClinical}>
                <StyledCheckboxList
                    options={treatmentTypes}
                    onWrite={writerContext}
                    groupName="treatment"
                    useAutoComplete={treatmentTypes.length >= 10}
                    hide={hideClinical}
                    checked={selectedTreatment}
                    setChecked={setSelectedTreatment}
                />
            </SidebarGroup>
            <SidebarGroup name="Tumour Primary Site" hide={hideClinical}>
                <StyledCheckboxList
                    options={tumourPrimarySites}
                    onWrite={writerContext}
                    groupName="primary_site"
                    useAutoComplete={tumourPrimarySites.length >= 10}
                    hide={hideClinical}
                    checked={selectedPrimarySite}
                    setChecked={setSelectedPrimarySite}
                />
            </SidebarGroup>
            <SidebarGroup name="Chemotherapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={chemotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="chemotherapy"
                    useAutoComplete={chemotherapyDrugNames.length >= 10}
                    hide={hideClinical}
                    checked={selectedChemotherapy}
                    setChecked={setSelectedChemotherapy}
                />
            </SidebarGroup>
            <SidebarGroup name="Immunotherapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={immunotherapyDrugNames}
                    onWrite={writerContext}
                    groupName="immunotherapy"
                    useAutoComplete={immunotherapyDrugNames.length >= 10}
                    hide={hideClinical}
                    checked={selectedImmunotherapy}
                    setChecked={setSelectedImmunotherapy}
                />
            </SidebarGroup>
            <SidebarGroup name="Hormone Therapy" hide={hideClinical}>
                <StyledCheckboxList
                    options={hormoneTherapyDrugNames}
                    onWrite={writerContext}
                    groupName="hormone_therapy"
                    useAutoComplete={hormoneTherapyDrugNames.length >= 10}
                    hide={hideClinical}
                    checked={selectedHormoneTherapy}
                    setChecked={setSelectedHormoneTherapy}
                />
            </SidebarGroup>
        </Root>
    );
}

export default Sidebar;
