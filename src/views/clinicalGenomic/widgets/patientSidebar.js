import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import { DataGrid } from '@mui/x-data-grid';

import { makeStyles, useTheme } from '@mui/styles';

import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';
import { fetchFederation } from '../../../store/api';

// Icons
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';

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
    },
    header: {
        margin: 0,
        borderLeft: `solid 0.5em ${theme.palette.primary.main}`,
        borderRadius: 0,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
        width: '100%'
    },
    subHeader: {
        paddingLeft: '1.5em',
        paddingRight: '1.5em'
    },
    subHeaderColor: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row'
    },
    centeredIconText: {
        display: 'flex',
        alignItems: 'center'
    },
    iconMargin: {
        marginRight: '0.5em'
    },
    subHeaderCollapsed: {
        paddingLeft: '1.5em',
        paddingRight: '1.5em',
        display: 'none'
    },
    subHeaderExpanded: {
        paddingLeft: '1.5em',
        paddingRight: '1.5em'
    },
    selected: {
        backgroundColor: theme.palette.primary.main,
        color: 'white'
    }
}));

function PatientSidebar({ sidebar, setColumns, setRows, setTitle }) {
    const classes = useStyles();
    const theme = useTheme();
    const [initialHeader, setInitialHeader] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [selected, setSelected] = useState('');

    function formatKey(key) {
        // Replace underscores with spaces and capitalize each word
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function handleToggleSection(key) {
        setExpandedSections((prevExpanded) => ({
            ...prevExpanded,
            [key]: !prevExpanded[key]
        }));
    }

    function handleTableSet(title, array) {
        const uniqueKeysSet = new Set();

        // Iterate through each object in the array
        array.forEach((obj) => {
            // Get the keys of the current object
            const keys = Object.keys(obj);

            // Add the keys to the Set to ensure uniqueness
            keys.forEach((key) => {
                uniqueKeysSet.add(key);
            });
        });

        // Convert the Set back to an array
        const uniqueKeys = Array.from(uniqueKeysSet);

        const columns = uniqueKeys.map((key) => ({
            field: key,
            headerName: formatKey(key),
            minWidth: 250
        }));

        const reorderedColumns = [...columns].sort((a, b) => {
            // Move columns with headerName ending in "ID" to the front
            const aEndsWithID = a.headerName.endsWith('Id');
            const bEndsWithID = b.headerName.endsWith('Id');

            if (aEndsWithID && !bEndsWithID) {
                return -1;
            } else if (!aEndsWithID && bEndsWithID) {
                return 1;
            } else {
                return 0;
            }
        });

        const rows = array.map((obj, index) => {
            const row = { id: index };

            uniqueKeys.forEach((key) => {
                row[key] = obj[key];
            });

            return row;
        });

        setTitle(formatKey(title));
        setColumns(reorderedColumns);
        setRows(rows);
    }

    function createSubSidebarHeaders(array, depth) {
        let sidebarTitles = [];
        let subTableMap = {};
        if (Array.isArray(array)) {
            array.forEach((obj, index) => {
                // array = array of primary diagnosis obj
                // obj = primary Diagnosis
                // key = specimen title
                // obj[key] = specimen array of obj
                // Primary Diagnosis is [{specimen: [{}]},{specimen: [{}]}]
                for (const key in obj) {
                    if (Array.isArray(obj[key]) && typeof obj[key][0] === 'object' && obj[key].length > 0) {
                        // Map all keys that have array obj and merge into key value set then loop
                        if (subTableMap.hasOwnProperty(key)) {
                            // Merge into value second array of objects
                            subTableMap[key] = subTableMap[key].concat(obj[key]);
                        } else {
                            subTableMap = {
                                ...subTableMap,
                                [key]: obj[key]
                            };
                        }
                    }
                }
            });
        }
        for (const key in subTableMap) {
            const isExpanded = expandedSections[key] ? expandedSections[key] : false;
            sidebarTitles.push(
                <div key={`${key}-${depth}`}>
                    <Button
                        className={
                            (isExpanded || depth <= 1 ? classes.subHeaderExpanded : classes.subHeaderCollapsed) +
                            (selected === key ? ` ${classes.selected}` : '')
                        }
                        onClick={() => {
                            handleToggleSection(key);
                            handleTableSet(key, subTableMap[key]);
                            setSelected(key);
                        }}
                    >
                        <p className={selected === key ? `${classes.selected} ${classes.subHeaderColor}` : classes.subHeaderColor}>
                            {isExpanded ? <FolderOpenIcon className={classes.iconMargin} /> : <FolderIcon className={classes.iconMargin} />}
                            {formatKey(key)}
                        </p>
                    </Button>
                    {isExpanded && createSubSidebarHeaders(subTableMap[key], depth + 1)}
                </div>
            );
        }
        return sidebarTitles;
    }

    function createSidebarHeaders(obj) {
        let sidebarTitles = [];
        for (const key in obj) {
            const value = obj[key];
            if (Array.isArray(obj[key]) && value.length > 0 && value.every((item) => typeof item === 'object')) {
                sidebarTitles.push(
                    <Button
                        className={selected === key ? `${classes.header} ${classes.selected}` : classes.header}
                        key={key}
                        onClick={() => {
                            handleTableSet(key, obj[key]);
                            setSelected(key);
                        }}
                    >
                        <h3 style={{ margin: 0 }}>{formatKey(key)}</h3>
                    </Button>
                );
                sidebarTitles = [...sidebarTitles, ...createSubSidebarHeaders(obj[key], 0)];
            }
        }
        return sidebarTitles;
    }

    return (
        <>
            <div>{createSidebarHeaders(sidebar)}</div>
        </>
    );
}

PatientSidebar.propTypes = {
    sidebar: PropTypes.any,
    setColumns: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired
};

export default PatientSidebar;
