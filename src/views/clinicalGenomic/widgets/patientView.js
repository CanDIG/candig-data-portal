import { useEffect, useState } from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { TreeView, TreeItem } from '@mui/lab';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useSearchResultsReaderContext } from '../SearchResultsContext';

const useStyles = makeStyles((theme) => ({
    label: {
        textTransform: 'capitalize',
        display: 'inline-flex'
    },
    searchMatch: {
        backgroundColor: '#FFFF00'
    }
}));

function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}

// Apply highlighting to a term if it is a string and the search expression exists
function applyHighlight(term, searchExp, highlightClass) {
    if (searchExp && typeof term === 'string') {
        const splitText = term.split(searchExp);
        return splitText.map((text) => (searchExp.test(text) ? <span className={highlightClass}>{text}</span> : text));
    }
    return term;
}

const JSONTree = (props) => {
    const { id, label, json, searchExp } = props;
    const classes = useStyles();
    let value = typeof json === 'number' || typeof json === 'string' ? json : '';
    if (typeof json === 'boolean') {
        value = String(json);
    }

    // Convert the label into a human-readable format
    let prettyLabel = typeof label === 'string' ? label.replaceAll('_', ' ') : label;

    // Search highlighting on label
    prettyLabel = applyHighlight(prettyLabel, searchExp, classes.searchMatch);
    value = applyHighlight(value, searchExp, classes.searchMatch);

    // Determine how we're going to display what's inside of the TreeItem:
    let innerItem;
    if (Array.isArray(json)) {
        if (json.length > 0) {
            // Displaying an array: return recursive JSONTrees, prefixed by their index
            innerItem = json.map((value, i) => <JSONTree id={`${id}/${i}`} label={i} json={value} key={i} searchExp={searchExp} />);
        } else {
            value = '[empty]';
        }
    } else if (isObject(json)) {
        // Displaying an object: return recursive JSONTrees, prefixed by their key
        innerItem = Object.keys(json)
            // Sort by whether or not the value is an array/object first, then alphabetically
            .sort((keyA, keyB) => {
                const aHasChildren = Array.isArray(json[keyA]) || isObject(json[keyA]);
                const bHasChildren = Array.isArray(json[keyB]) || isObject(json[keyB]);
                if (aHasChildren && !bHasChildren) {
                    return 1;
                }
                if (bHasChildren && !aHasChildren) {
                    return -1;
                }
                if (keyA === keyB) {
                    return 0;
                }
                return keyA <= keyB ? -1 : 1;
            })
            .map((key) => <JSONTree id={`${id}/${key}`} label={key} json={json[key]} key={key} searchExp={searchExp} />);
    } else {
        // Displaying a single value -- we just need the outer TreeItem
    }

    return (
        <TreeItem
            nodeId={id}
            label={
                <Box sx={{ justifyContent: 'flex-start', alignItems: 'center', p: 0.5, pr: 0 }}>
                    <Box color="inherit" sx={{ mr: 1 }} />
                    <div className={classes.label}>
                        <b>{prettyLabel}</b>
                    </div>{' '}
                    {value ? <>: {value}</> : ''}
                </Box>
            }
        >
            {innerItem}
        </TreeItem>
    );
};

function PatientView(props) {
    const resultsContext = useSearchResultsReaderContext();
    const patient = resultsContext.donor?.[0]?.results?.results?.[0];
    const [expanded, setExpanded] = useState(['.']);

    // When searching: search, then prune the results
    const [search, setSearch] = useState('');
    const [prunedPatient, setPrunedPatient] = useState({});
    const theme = useTheme();

    const getAllChildIDs = (json, prefix, includeValues) => {
        if (Array.isArray(json)) {
            return [prefix].concat(json.map((value, i) => getAllChildIDs(value, `${prefix}/${i}`, includeValues))).flat(1);
        }
        if (isObject(json)) {
            return [prefix].concat(Object.keys(json).map((key) => getAllChildIDs(json[key], `${prefix}/${key}`, includeValues))).flat(1);
        }
        return includeValues ? [`${prefix}:${typeof json === 'string' ? json.toLowerCase() : json}`] : [];
    };

    // Prune the patient entry according to search
    const recursivePrune = (json, searchTerm) => {
        if (Array.isArray(json)) {
            // Create a new array with pruned children
            const retVal = json.map((child) => recursivePrune(child, searchTerm)).filter((child) => child !== undefined);
            return retVal.length <= 0 ? undefined : retVal;
        }

        if (isObject(json)) {
            // Find any key that matches the search
            const retVal = {};
            Object.keys(json).forEach((key) => {
                if (key.toLowerCase().indexOf(searchTerm) >= 0) {
                    // include all children of a matching parent
                    retVal[key] = json[key];
                    return;
                }

                // For all non-valid keys, there might be a valid child -- recurse downwards and prune
                const childObj = recursivePrune(json[key], searchTerm);
                if (childObj !== undefined) {
                    retVal[key] = childObj;
                }
            });
            return Object.keys(retVal).length > 0 ? retVal : undefined;
        }

        if (typeof json === 'string' && json.toLowerCase().indexOf(searchTerm) >= 0) {
            // Check if we're a match of the search
            return json;
        }

        return undefined;
    };

    const handleExpandAll = () => {
        setExpanded((old) => (old.length <= 1 ? getAllChildIDs(prunedPatient, '.', false) : ['.']));
    };

    const handleToggle = (_, nodeIds) => {
        setExpanded(nodeIds);
    };

    // Change the currently-searched-for term
    const handleSearch = (searchTerm) => {
        // Prune our patient object based on the search
        const searchTermProcessed = searchTerm.toLowerCase().replaceAll(' ', '_');
        setSearch(searchTermProcessed);

        if (searchTerm !== '') {
            // If the user is searching for something, prune the tree to only matching terms
            const pruned = recursivePrune(patient, searchTermProcessed);
            setPrunedPatient(pruned);

            // Also automatically expand the tree (so the user can see results)
            // However, we can't just get _all_ child IDs, because if a parent matches
            // but not its children, we want to keep the parent collapsed.
            let childIDs = getAllChildIDs(pruned, '.', true)
                // Does the search term appear _after_ the last /?
                .filter((key) => key.lastIndexOf(searchTermProcessed) > key.lastIndexOf('/'))
                .map((key) => {
                    // If we have a value, grab everything up to the value
                    let truncatedKey = key.split(':');
                    if (truncatedKey.length > 1) {
                        truncatedKey = truncatedKey.slice(0, truncatedKey.length - 1);
                    }
                    truncatedKey = truncatedKey.join(':');

                    // Create a list of all of the parents, up to the parent
                    const splitKey = truncatedKey.split('/');
                    return splitKey.map((_, index) => splitKey.slice(0, index + 1).join('/'));
                })
                .flat(1);
            // Remove duplicates
            childIDs = Array.from(new Set(childIDs));
            setExpanded(childIDs);
        } else {
            // Otherwise, clear the prunedPatient view
            setPrunedPatient(patient);
        }
    };

    // When the patient changes, we need to update the pruned view according to search
    useEffect(() => {
        if (search !== '') {
            setPrunedPatient(recursivePrune(patient, search));
        } else {
            // Otherwise, just reset the prunedPatient view to the patient view
            setPrunedPatient(patient);
        }
    }, [JSON.stringify(patient)]);

    const noResultsMessage = !patient ? (
        'Please select a patient to see results'
    ) : (
        <>
            No results for <span>{search}</span> were found in this patient.
        </>
    );

    return (
        <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Patient Info
                </Typography>
                <TextField
                    id="filled-search"
                    label="Search"
                    type="search"
                    variant="outlined"
                    size="small"
                    onChange={(event) => {
                        handleSearch(event.target.value);
                    }}
                />
                <Button onClick={handleExpandAll}>{expanded.length <= 1 ? 'Expand all' : 'Collapse all'}</Button>
            </Box>
            {prunedPatient ? (
                <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={expanded}
                    onNodeToggle={handleToggle}
                >
                    <JSONTree
                        id="."
                        label={`Patient ${patient?.submitter_donor_id || ''}`}
                        json={prunedPatient}
                        searchExp={search ? new RegExp(`(${search})`, 'gi') : undefined}
                    />
                </TreeView>
            ) : (
                <Typography>{noResultsMessage}</Typography>
            )}
        </Box>
    );
}

export default PatientView;
