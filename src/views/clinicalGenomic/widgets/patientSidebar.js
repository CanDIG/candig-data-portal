import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/system';
import { Button, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { formatKey } from '../../../utils/utils';

const HeaderButton = styled(Button)(({ theme, selected }) => ({
    textAlign: 'left',
    borderLeft: `solid 0.5em ${theme.palette.primary.main}`,
    borderRadius: 0,
    backgroundColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    color: selected ? 'white' : theme.palette.primary.main,
    width: '100%',
    margin: 0,
    display: 'flex',
    flexDirection: 'row'
}));

const SubHeader = styled('div')(({ theme, isExpanded, depth, selected, paddingValue, folderDepth }) => ({
    borderRadius: 0,
    margin: 0,
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    textAlign: 'left',
    // Add conditional styles based on props
    paddingLeft: isExpanded || depth <= 1 ? `${folderDepth + depth * 1}em` : '0',
    display: isExpanded ? 'block' : 'flex',
    backgroundColor: selected ? theme.palette.primary.main : 'transparent'
}));

const SubHeaderTypography = styled(Typography)(({ theme, selected }) => ({
    borderRadius: 0,
    margin: 0,
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    color: selected ? 'white' : theme.palette.primary.main,
    textAlign: 'left',
    paddingLeft: `1.5em`
}));

const CenteredIconText = styled('div')({
    display: 'flex',
    alignItems: 'center'
});

function PatientSidebar({ sidebar = {}, setColumns, setRows, setTitle }) {
    const theme = useTheme();
    const [initialHeader, setInitialHeader] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [selected, setSelected] = useState('');

    const toggleSection = (key) => {
        setExpandedSections((prevExpanded) => ({
            ...prevExpanded,
            [key]: !prevExpanded[key]
        }));
    };

    function handleTableSet(title, array) {
        const uniqueKeysSet = new Set();

        array.forEach((obj) => {
            const entries = Object.entries(obj);

            const validEntries = entries.filter((value) => value !== null && value !== undefined && value !== '');

            validEntries.forEach(([key]) => {
                uniqueKeysSet.add(key);
            });
        });

        const uniqueKeys = Array.from(uniqueKeysSet);

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

    function findIdKey(obj) {
        const idKeys = obj.map((item) => {
            const keyArray = Object.keys(item);
            return keyArray.find((key) => Object.prototype.hasOwnProperty.call(item, key) && key.toLowerCase().endsWith('_id'));
        });

        return idKeys.filter((idKey) => idKey !== undefined && idKey !== null);
    }

    const handleHeaderClick = (key, obj, parentID) => {
        const idKey = findIdKey(obj[key]);
        handleTableSet(key, obj[key], parentID, idKey);
        setSelected(key);
    };

    useEffect(() => {
        const handleHeaderClick = (key, obj, parentID) => {
            const idKey = findIdKey(obj[key]);
            handleTableSet(key, obj[key], parentID, idKey);
            setSelected(key);
        };

        if (initialHeader) {
            let firstHeaderKey = null;
            Object.keys(sidebar).some((key) => {
                const value = sidebar[key];
                if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'object')) {
                    firstHeaderKey = key;
                    return true;
                }
                return false;
            });

            if (firstHeaderKey) {
                setInitialHeader(false);
                setSelected(firstHeaderKey);
                handleHeaderClick(firstHeaderKey, sidebar, null);
            }
        }
    }, [initialHeader, sidebar]);

    function createSubSidebarHeaders(array = [], depth = 0, hasChildren = false) {
        const sidebarTitles = [];
        const subTableMap = {};
        if (Array.isArray(array)) {
            array.forEach((obj) => {
                const subTablePart = {};
                const idMap = {};
                Object.keys(obj).forEach((key) => {
                    if (Array.isArray(obj[key]) && typeof obj[key][0] === 'object' && obj[key].length > 0) {
                        subTablePart[key] = obj[key].slice();
                    } else if (key.toLowerCase().endsWith('_id')) {
                        idMap[key] = obj[key];
                    }
                });
                Object.keys(subTablePart).forEach((key) => {
                    subTablePart[key].forEach((row) => {
                        Object.keys(idMap).forEach((key) => {
                            row[key] = idMap[key];
                        });
                    });
                    if (subTableMap[key]) {
                        subTableMap[key] = subTableMap[key].concat(subTablePart[key]);
                    } else {
                        subTableMap[key] = subTablePart[key].slice();
                    }
                });
            });
        }
        Object.keys(subTableMap).forEach((key) => {
            const isExpanded = expandedSections[key] || false;
            const folderDepth = hasChildren ? 0 : 1.5;
            const paddingValue = `${folderDepth + depth * 1}em`;

            sidebarTitles.push(
                <div key={`${key}-${depth}-${folderDepth}`}>
                    <SubHeader
                        isExpanded={isExpanded}
                        depth={depth}
                        selected={selected === key}
                        folderDepth={folderDepth}
                        onClick={() => {
                            toggleSection(key);
                            const idKey = findIdKey(subTableMap[key]);
                            handleTableSet(key, subTableMap[key], idKey);
                            setSelected(key);
                        }}
                    >
                        <SubHeaderTypography variant="body1" selected={selected === key}>
                            {hasChildren && isExpanded && <FolderOpenIcon style={{ marginRight: '0.25em' }} />}
                            {hasChildren && !isExpanded && <FolderIcon style={{ marginRight: '0.25em' }} />}
                            {formatKey(key)}
                        </SubHeaderTypography>
                    </SubHeader>
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

    function createMainSidebarHeaders(obj = {}, parentID = null) {
        let sidebarTitles = [];
        Object.keys(obj).forEach((key) => {
            const value = obj[key];

            if (Array.isArray(obj[key]) && value.length > 0 && value.every((item) => typeof item === 'object')) {
                sidebarTitles.push(
                    <HeaderButton
                        key={key}
                        selected={selected === key}
                        onClick={() => {
                            const idKey = findIdKey(obj[key]);
                            handleTableSet(key, obj[key], parentID, idKey);
                            setSelected(key);
                        }}
                    >
                        <SubHeader variant="h6">
                            <FolderOpenIcon style={{ marginRight: '0.25em' }} />
                            {formatKey(key)}
                        </SubHeader>
                    </HeaderButton>
                );
                sidebarTitles = [...sidebarTitles, ...createSubSidebarHeaders(obj[key], 0, true)];
            }
        });
        return sidebarTitles;
    }

    return <div>{createMainSidebarHeaders(sidebar)}</div>;
}

PatientSidebar.propTypes = {
    sidebar: PropTypes.object,
    setColumns: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired
};

export default PatientSidebar;
