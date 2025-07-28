import { useEffect, useState } from 'react';

import {
    Chip,
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
    Button,
    Tooltip
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useTheme } from '@mui/system';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';

const PREFIX = 'Sidebar';

const classes = {
    tab: `${PREFIX}-tab`,
    checkbox: `${PREFIX}-checkbox`,
    form: `${PREFIX}-form`,
    checkboxLabel: `${PREFIX}-checkboxLabel`,
    hidden: `${PREFIX}-hidden`,
    button: `${PREFIX}-button`,
    lockIcon: `${PREFIX}-lockIcon`,
    lockContainer: `${PREFIX}-lockContainer`
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
        width: '45%',
        boxShadow: `0px 2px 4px rgba(0, 0, 0, 0.2)`
    },
    [`& .${classes.lockIcon}`]: {
        color: theme.palette.primary.main,
        marginLeft: '0.25em',
        fontSize: '1.25em'
    },
    [`& .${classes.lockContainer}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
    const {
        isExclusion,
        groupName,
        isFilterList,
        onWrite,
        options,
        authorizedPrograms,
        useAutoComplete,
        hide,
        selectedPrograms,
        setSelectedPrograms,
        checked,
        setChecked
    } = props;

    const context = useSearchResultsReaderContext();
    const sites = context?.federation;

    if (hide) {
        return null;
    }

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const HandleChange = (ids, isChecked) => {
        // Remove duplicates
        if (Array.isArray(ids)) {
            ids = Array.from(new Set(ids?.flat(1)));
        } else {
            ids = [ids];
        }

        const cohortMap = {};
        sites?.forEach((site) => {
            site?.results?.forEach((result) => {
                if (!cohortMap[result.program_id]) {
                    cohortMap[result.program_id] = new Set();
                }
                cohortMap[result.program_id].add(site.location.name);
            });
        });

        if (isExclusion ? !isChecked : isChecked) {
            setChecked((_) => {
                const retVal = {};
                ids.forEach((id) => {
                    retVal[id] = true;
                });
                return retVal;
            });
            onWrite((old) => {
                const retVal = { donorLists: {}, filter: {}, query: {}, ...old };
                // The following appends ourselves to the write context under 'query': {group: [|-delimited-list]} or 'donorList': {group: [|-delimited-list]}
                if (isFilterList) {
                    retVal.filter[groupName] = ids;
                    if (groupName === 'node') {
                        const programIds = sites
                            .filter((item) => ids.includes(item.location.name)) // Check if location.name is in ids array
                            .flatMap((item) => item.results.map((result) => result.program_id)); // Extract program_id
                        const validProgramIds = programIds.filter((programId) => {
                            const associatedNodes = cohortMap[programId] || new Set();
                            return Array.from(associatedNodes).every((node) => !(node in checked));
                        });
                        retVal.query.exclude_programs = validProgramIds.join('|');
                        setSelectedPrograms((old) => {
                            const newPrograms = { ...old };
                            validProgramIds.forEach((id) => {
                                newPrograms[id] = true;
                            });
                            return newPrograms;
                        });
                    }
                } else if (ids.length > 0) {
                    retVal.query[groupName] = ids.join('|');
                }
                return retVal;
            });
        } else {
            setChecked((_) => {
                const retVal = {};
                ids.forEach((id) => {
                    retVal[id] = true;
                });
                return retVal;
            });
            onWrite((old) => {
                const retVal = { filter: {}, query: {}, ...old };
                if (isFilterList) {
                    const newList = Object.fromEntries(Object.entries(retVal.filter).filter(([name, _]) => name !== groupName));
                    newList[groupName] = ids;
                    retVal.filter = newList;
                    if (groupName === 'node') {
                        const currentPrograms = { ...selectedPrograms };
                        Object.keys(selectedPrograms).forEach((id) => {
                            if (currentPrograms[id]) {
                                delete currentPrograms[id];
                            }
                        });
                        if (currentPrograms && Object.keys(currentPrograms).length > 0) {
                            retVal.query.exclude_programs = Object.keys(currentPrograms)
                                .filter((id) => currentPrograms[id])
                                .join('|');
                        } else {
                            delete retVal.query.exclude_programs;
                            retVal.query = {};
                        }
                        setSelectedPrograms(currentPrograms);
                    }
                } else {
                    const newList = Object.fromEntries(Object.entries(retVal.query).filter(([name, _]) => name !== groupName));
                    if (ids.length > 0) {
                        newList[groupName] = ids.join('|');
                    }
                    retVal.query = newList;
                }

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
                <li {...props} key={option}>
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
            renderInput={(params) => <TextField {...params} label={groupName === 'exclude_programs' ? 'Programs' : groupName} />}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option} label={option} />)
            }
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
                label={
                    <div className={classes.lockContainer}>
                        {option}
                        {groupName === 'exclude_programs' && authorizedPrograms && !authorizedPrograms.includes(option) && (
                            <Tooltip title="Unauthorized Program" placement="right">
                                <LockOutlinedIcon className={classes.lockIcon} />
                            </Tooltip>
                        )}
                    </div>
                }
                control={
                    <Checkbox
                        className={classes.checkbox}
                        checked={isExclusion ? !(option in checked) : option in checked}
                        onChange={(event) => {
                            const newList = Object.keys(checked).slice();
                            if (!(option in checked)) {
                                // Add to list
                                newList.push(option);
                            } else {
                                // Remove from list
                                const oldPos = newList.indexOf(option);
                                if (oldPos >= 0) {
                                    newList.splice(oldPos, 1);
                                }
                            }
                            HandleChange(newList, event.target.checked);
                        }}
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
    authorizedPrograms: PropTypes.array,
    hide: PropTypes.bool,
    isDonorList: PropTypes.bool,
    isFilterList: PropTypes.bool,
    remap: PropTypes.func,
    onWrite: PropTypes.func,
    options: PropTypes.array,
    useAutoComplete: PropTypes.bool,
    setSelectedPrograms: PropTypes.func,
    selectedPrograms: PropTypes.object,
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
        setEndPos,
        selectedGenomicDataTypes,
        setGenomicDataTypes
    } = props;

    const [selectedGenome, _setSelectedGenome] = useState('hg38');
    const [_timeout, setNewTimeout] = useState(null);

    const writerContext = useSearchQueryWriterContext();

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
            <SidebarGroup name="Genomic Data Types">
                <StyledCheckboxList
                    options={['Variants', 'Transcriptomes (WTS)', 'Reads (WGS)']}
                    onWrite={writerContext}
                    groupName="genomicDataTypes"
                    isFilterList
                    checked={selectedGenomicDataTypes}
                    setChecked={setGenomicDataTypes}
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
    setSelectedChromosomes: PropTypes.func,
    selectedGenomicDataTypes: PropTypes.string,
    setGenomicDataTypes: PropTypes.func
};

function Sidebar() {
    const [selectedtab, setSelectedTab] = useState('All');
    const readerContext = useSearchResultsReaderContext();
    const writerContext = useSearchQueryWriterContext();

    // Genomic data
    // const referenceGenomes = ['hg38'];
    const [selectedChromosomes, setSelectedChromosomes] = useState('');
    const [selectedGenes, setSelectedGenes] = useState('');
    const [startPos, setStartPos] = useState('0');
    const [endPos, setEndPos] = useState('0');
    const [selectedGenomicDataTypes, setGenomicDataTypes] = useState(['Variants', 'Transcriptomes (WTS)', 'Reads (WGS)']);

    // Clinical Data
    const [selectedNodes, setSelectedNodes] = useState({});
    const [selectedPrograms, setSelectedPrograms] = useState({});
    const [selectedTreatment, setSelectedTreatment] = useState({});
    const [selectedPrimarySite, setSelectedPrimarySite] = useState({});
    const [selectedSystemicTherapy, setSelectedSystemicTherapy] = useState({});

    // On our first load, remove all query parameters
    useEffect(() => {
        writerContext(() => ({ reqNum: 0 }));
    }, [writerContext]);

    // Certain webpage components can cause the sidebar to clear a particular entry (e.g. the search explanation)
    useEffect(() => {
        if (readerContext.clear === 'nodes') {
            setSelectedNodes({});
            writerContext((old) => ({
                ...old,
                filter: {
                    ...old.filter,
                    node: [readerContext?.programs?.map((loc) => loc.location.name) || []]
                },
                reqNum: old.reqNum + 1
            }));
        } else if (readerContext.clear === 'programs') {
            setSelectedPrograms({});
            writerContext((old) => ({
                ...old,
                filter: {
                    ...old.filter,
                    exclude_programs: [
                        readerContext?.programs?.map((loc) => loc?.results?.items?.map((program) => program.program_id)).flat(1) || []
                    ]
                },
                reqNum: old.reqNum + 1
            }));
        } else if (readerContext.clear === 'gene' || readerContext.clear === 'chrom' || readerContext.clear === 'assembly') {
            setSelectedGenes('');
            setSelectedChromosomes('');
            setStartPos('0');
            setEndPos('0');
            setGenomicDataTypes(['Variants', 'Transcriptomes (WTS)', 'Reads (WGS)']);
            writerContext((old) => {
                const retVal = { ...old, reqNum: old.reqNum + 1 };
                delete retVal.query.chrom;
                delete retVal.query.gene;
                delete retVal.query.assembly;
                return retVal;
            });
        } else if (readerContext.clear === 'treatment') {
            setSelectedTreatment({});
            writerContext((old) => {
                const retVal = { ...old, reqNum: old.reqNum + 1 };
                delete retVal.query.treatment;
                return retVal;
            });
        } else if (readerContext.clear === 'primary_site') {
            setSelectedPrimarySite({});
            writerContext((old) => {
                const retVal = { ...old, reqNum: old.reqNum + 1 };
                delete retVal.query.primary_site;
                return retVal;
            });
        } else if (readerContext.clear === 'drug_name') {
            setSelectedSystemicTherapy({});
            writerContext((old) => {
                const retVal = { ...old, reqNum: old.reqNum + 1 };
                delete retVal.query.drug_name;
                return retVal;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readerContext.clear]);

    const triggerSearch = () => {
        writerContext((old) => ({ ...old, reqNum: 'reqNum' in old ? old.reqNum + 1 : 0 }));
    };

    function resetButton() {
        // Reset state variables for checkboxes and dropdowns
        setSelectedNodes({});
        setSelectedPrograms({});

        // Genomic
        setSelectedGenes('');
        setSelectedChromosomes('');
        setStartPos('0');
        setEndPos('0');
        setGenomicDataTypes(['Variants', 'Transcriptomes (WTS)', 'Reads (WGS)']);

        // Clinical
        setSelectedTreatment({});
        setSelectedPrimarySite({});
        setSelectedSystemicTherapy({});

        // Set context writer to include only nodes and programs
        writerContext({
            // Set nodes and programs in the filter
            filter: {
                node: [readerContext?.programs?.map((loc) => loc.location.name) || []], // Set your default nodes
                exclude_programs: [
                    readerContext?.programs?.map((loc) => loc?.results?.items?.map((program) => program.program_id)).flat(1) || []
                ], // Set programs to empty array or whichever default value you want
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
    const sites = readerContext?.federation?.map((loc) => loc.location.name) || [];
    const programs = readerContext?.federation?.map((loc) => loc.results?.map((program) => program.program_id) || [])?.flat(1) || [];
    const authorizedPrograms = readerContext?.programs?.flatMap((loc) => loc?.results?.items?.map((program) => program.program_id)) || [];
    const treatmentTypes = ExtractSidebarElements('treatment_types');
    const tumourPrimarySites = ExtractSidebarElements('tumour_primary_sites');
    const systemicTherapyDrugNames = ExtractSidebarElements('drug_names');
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
                    Reset
                </Button>
                <Button className={classes.button} onClick={triggerSearch}>
                    Search
                </Button>
            </div>
            <SidebarGroup name="Nodes">
                <StyledCheckboxList
                    options={sites}
                    onWrite={writerContext}
                    groupName="node"
                    useAutoComplete={sites.length >= 5}
                    isFilterList
                    isExclusion
                    selectedPrograms={selectedPrograms}
                    setSelectedPrograms={setSelectedPrograms}
                    checked={selectedNodes}
                    setChecked={setSelectedNodes}
                />
            </SidebarGroup>
            <SidebarGroup name="Programs">
                <StyledCheckboxList
                    options={programs}
                    authorizedPrograms={authorizedPrograms}
                    onWrite={writerContext}
                    groupName="exclude_programs"
                    useAutoComplete={programs.length >= 5}
                    isExclusion
                    checked={selectedPrograms}
                    setChecked={setSelectedPrograms}
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
                setGenomicDataTypes={setGenomicDataTypes}
                selectedGenomicDataTypes={selectedGenomicDataTypes}
            />
            <SidebarGroup name="Treatments" hide={hideClinical}>
                <StyledCheckboxList
                    options={treatmentTypes}
                    onWrite={writerContext}
                    groupName="treatment"
                    useAutoComplete={treatmentTypes.length >= 5}
                    hide={hideClinical}
                    checked={selectedTreatment}
                    setChecked={setSelectedTreatment}
                />
            </SidebarGroup>
            <SidebarGroup name="Tumour Primary Sites" hide={hideClinical}>
                <StyledCheckboxList
                    options={tumourPrimarySites}
                    onWrite={writerContext}
                    groupName="primary_site"
                    useAutoComplete={tumourPrimarySites.length >= 5}
                    hide={hideClinical}
                    checked={selectedPrimarySite}
                    setChecked={setSelectedPrimarySite}
                />
            </SidebarGroup>
            <SidebarGroup name="Systemic Therapy Drug Names" hide={hideClinical}>
                <StyledCheckboxList
                    options={systemicTherapyDrugNames}
                    onWrite={writerContext}
                    groupName="drug_name"
                    useAutoComplete={systemicTherapyDrugNames.length >= 5}
                    hide={hideClinical}
                    checked={selectedSystemicTherapy}
                    setChecked={setSelectedSystemicTherapy}
                />
            </SidebarGroup>
        </Root>
    );
}

export default Sidebar;
