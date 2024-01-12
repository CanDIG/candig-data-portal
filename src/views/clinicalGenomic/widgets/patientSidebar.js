import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from '@mui/material';

import { makeStyles, useTheme } from '@mui/styles';

// Icons
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';

// Functions import
import { formatKey } from '../../../utils/utils';

const useStyles = makeStyles((theme) => ({
    header: {
        display: 'flex',
        flexDirection: 'row',
        margin: 0,
        borderLeft: `solid 0.5em ${theme.palette.primary.main}`,
        borderRadius: 0,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
        width: '100%',
        textAlign: 'left'
    },
    subHeader: {
        borderRadius: 0,
        margin: 0,
        fontWeight: 'bold',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%'
    },
    subHeaderColor: {
        color: theme.palette.primary.main
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

function PatientSidebar({ sidebar = {}, setColumns, setRows, setTitle }) {
    const classes = useStyles();
    const [initialHeader, setInitialHeader] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [selected, setSelected] = useState('');

    // Function to toggle expanded sections in the sidebar
    const toggleSection = (key) => {
        setExpandedSections((prevExpanded) => ({
            ...prevExpanded,
            [key]: !prevExpanded[key]
        }));
    };

    // Function to handle setting data for the table
    function handleTableSet(title, array) {
        const uniqueKeysSet = new Set();

        // Iterate through each object in the array
        array.forEach((obj) => {
            // Get the keys and values of the current object
            const entries = Object.entries(obj);

            // Filter out keys with no data or empty string in any row
            const validEntries = entries.filter((value) => value !== null && value !== undefined && value !== '');

            // Add the valid keys to the Set to ensure uniqueness
            validEntries.forEach(([key]) => {
                uniqueKeysSet.add(key);
            });
        });

        // Convert the Set back to an array
        const uniqueKeys = Array.from(uniqueKeysSet);

        // Filter columns to include only those with non-empty values in any row
        const columns = uniqueKeys.map((key) => {
            const hasNonEmptyValue = array.some(
                (obj) =>
                    obj[key] !== null &&
                    obj[key] !== undefined &&
                    obj[key] !== '' &&
                    !(typeof obj[key] === 'object') &&
                    (!(typeof obj[key] === 'object') || Object.keys(obj[key]).length > 0)
            );
            return hasNonEmptyValue
                ? {
                      field: key,
                      headerName: formatKey(key),
                      flex: 1,
                      minWidth: 250
                  }
                : null;
        });

        // Remove null values from the columns array
        const filteredColumns = columns.filter((column) => column !== null);

        const reorderedColumns = [...filteredColumns].sort((a, b) => {
            const aEndsWithID = a.headerName.endsWith('Id');
            const bEndsWithID = b.headerName.endsWith('Id');

            if (aEndsWithID && !bEndsWithID) {
                return -1;
            }
            if (!aEndsWithID && bEndsWithID) {
                return 1;
            }
            return 0;
        });

        const rows = array.map((obj, index) => {
            const row = { id: index };

            filteredColumns.forEach((column) => {
                row[column.field] = obj[column.field];
            });

            return row;
        });

        setTitle(formatKey(title));
        setColumns(reorderedColumns);
        setRows(rows);
    }

    // Function to find keys ending with '_id' in an array of objects
    // @param {Array} obj - The array of objects to search for '_id' keys.
    // @returns {Array} - An array containing keys ending with '_id'.
    function findIdKey(obj) {
        const idKeys = obj.map((item) => {
            const keyArray = Object.keys(item);
            return keyArray.find((key) => Object.prototype.hasOwnProperty.call(item, key) && key.toLowerCase().endsWith('_id'));
        });
        // Filter out undefined or null values from the idKeys array
        return idKeys.filter((idKey) => idKey !== undefined && idKey !== null);
    }

    // Function to handle click events in the header
    const handleHeaderClick = (key, obj, parentID) => {
        const idKey = findIdKey(obj[key]);
        handleTableSet(key, obj[key], parentID, idKey);
        setSelected(key);
    };

    useEffect(() => {
        if (initialHeader) {
            // Find the first header key
            let firstHeaderKey = null;
            Object.keys(sidebar).some((key) => {
                const value = sidebar[key];
                if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'object')) {
                    firstHeaderKey = key;
                    return true; // Exit the loop once the first header key is found
                }
                return false;
            });

            // Set the initial selected key if found and trigger the click event
            if (firstHeaderKey) {
                setInitialHeader(false);
                setSelected(firstHeaderKey);
                handleHeaderClick(firstHeaderKey, sidebar, null);
            }
        }
    }, [initialHeader, handleHeaderClick, sidebar]);

    // Function to create subheaders in the sidebar
    function createSubSidebarHeaders(array = [], depth = 0, hasChildren = false) {
        const sidebarTitles = [];
        const subTableMap = {};
        if (Array.isArray(array)) {
            array.forEach((obj) => {
                // PD
                const subTablePart = {};
                const idMap = {};
                Object.keys(obj).forEach((key) => {
                    // spec, treat
                    if (Array.isArray(obj[key]) && typeof obj[key][0] === 'object' && obj[key].length > 0) {
                        subTablePart[key] = obj[key].slice(); // Initialize as a copy of the array
                    } else if (key.toLowerCase().endsWith('_id')) {
                        idMap[key] = obj[key];
                    }
                });
                Object.keys(subTablePart).forEach((key) => {
                    // For each array in current PD
                    subTablePart[key].forEach((row) => {
                        // For each row in array
                        Object.keys(idMap).forEach((key) => {
                            row[key] = idMap[key];
                        });
                    });
                    if (subTableMap[key]) {
                        // Add to matching table
                        subTableMap[key] = subTableMap[key].concat(subTablePart[key]);
                    } else {
                        subTableMap[key] = subTablePart[key].slice(); // Initialize as a copy of the array
                    }
                });
            });
        }
        Object.keys(subTableMap).forEach((key) => {
            const isExpanded = expandedSections[key] || false;
            const folderDepth = hasChildren ? 0 : 1.5;
            const paddingValue = `${folderDepth + depth * 1}em`;

            sidebarTitles.push(
                <div key={`${key}-${depth}`}>
                    <Button
                        style={{ textAlign: 'left', alignItems: 'flex-start' }}
                        className={`${isExpanded || depth <= 1 ? classes.subHeaderExpanded : classes.subHeaderCollapsed} 
                            ${classes.subHeader} 
                            ${selected === key ? classes.selected : ''}`}
                        onClick={() => {
                            toggleSection(key);
                            const idKey = findIdKey(subTableMap[key]);
                            handleTableSet(key, subTableMap[key], idKey);
                            setSelected(key);
                        }}
                    >
                        <Typography
                            variant="body1"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                textAlign: 'left',
                                width: '100%',
                                paddingLeft: paddingValue
                            }}
                            className={`${selected === key ? classes.selected : ''} ${classes.subHeaderColor}`}
                        >
                            {hasChildren && isExpanded && <FolderOpenIcon className={classes.iconMargin} />}
                            {hasChildren && !isExpanded && <FolderIcon className={classes.iconMargin} />}
                            {formatKey(key)}
                        </Typography>
                    </Button>
                    {isExpanded &&
                        createSubSidebarHeaders(
                            subTableMap[key],
                            depth + 1,
                            Array.isArray(subTableMap[key]) &&
                                subTableMap[key].some(
                                    (obj) =>
                                        Array.isArray(obj) &&
                                        obj.length > 0 &&
                                        Object.values(obj).some((value) => Array.isArray(value) && value.length > 0)
                                )
                        )}
                </div>
            );
        });

        return sidebarTitles;
    }

    // Function to create main headers in the sidebar
    function createMainSidebarHeaders(obj = {}, parentID = null) {
        let sidebarTitles = [];
        Object.keys(obj).forEach((key) => {
            const value = obj[key];

            if (Array.isArray(obj[key]) && value.length > 0 && value.every((item) => typeof item === 'object')) {
                sidebarTitles.push(
                    <Button
                        style={{ textAlign: 'left' }}
                        className={selected === key ? `${classes.header} ${classes.selected}` : classes.header}
                        key={key}
                        onClick={() => {
                            const idKey = findIdKey(obj[key]);
                            handleTableSet(key, obj[key], parentID, idKey);
                            setSelected(key);
                        }}
                    >
                        <Typography
                            variant="h6"
                            style={{ display: 'flex', alignItems: 'flex-end', margin: 0, width: '100%', textAlign: 'left' }}
                            className={`${selected === key ? `${classes.subHeaderColor} ${classes.selected}` : classes.subHeaderColor}`}
                        >
                            <FolderOpenIcon className={classes.iconMargin} />
                            {formatKey(key)}
                        </Typography>
                    </Button>
                );
                sidebarTitles = [...sidebarTitles, ...createSubSidebarHeaders(obj[key], 0, true)]; // Pass the ID key
            }
        });
        return sidebarTitles;
    }

    return (
        <>
            <div>{createMainSidebarHeaders(sidebar)}</div>
        </>
    );
}

PatientSidebar.propTypes = {
    sidebar: PropTypes.object,
    setColumns: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired
};

export default PatientSidebar;
