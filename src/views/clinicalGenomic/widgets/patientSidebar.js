import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';
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

const SubHeader = styled('div')(({ theme, isExpanded, depth, selected, folderDepth }) => ({
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

function PatientSidebar({ sidebar = {}, setColumns, setRows, setTitle, ageAtFirstDiagnosis, forceSelection }) {
    const [initialHeader, setInitialHeader] = useState(true);
    const [expandedSections, setExpandedSections] = useState({});
    const [selected, setSelected] = useState('');

    // If we're told to select a sidebar entry (e.g. by Timeline), do so
    useEffect(() => {
        if (forceSelection[1] != null) {
            const categoryName = forceSelection[1][0];
            const categoryDepth = forceSelection[1][1];
            const categoryKey = categoryName + (categoryDepth > 0 ? `-${categoryDepth - 1}-${categoryDepth > 1 ? 1.5 : 0}` : '');
            setSelected(categoryKey);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forceSelection[0]]);

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

        let startDate;
        let endDate;
        const columns = uniqueKeys.map((key) => {
            const hasNonEmptyValue = array.some((obj) => {
                if (Array.isArray(obj[key])) {
                    // Include arrays of strings
                    return obj[key].length > 0 && obj[key].every((item) => typeof item === 'string');
                }

                return (
                    obj[key] !== null &&
                    obj[key] !== undefined &&
                    obj[key] !== '' &&
                    (!(typeof obj[key] === 'object') || (typeof obj[key] === 'object' && 'month_interval' in obj[key]))
                );
            });

            let value = key;
            if (key === 'date_of_diagnosis') {
                value = `Age at Diagnosis`;
            } else if (key.endsWith('_start_date')) {
                value = `Diagnosis_to_${key}`;
                startDate = key;
            } else if (key.endsWith('_end_date')) {
                value = key.split('_end_date')[0];
                value = `${value.trim()} Duration`;
                endDate = key;
            } else if (key.startsWith('date_of_')) {
                value = key.split('date_of_')[1];
                value = `Diagnosis_to_${value.trim()}`;
            }

            return hasNonEmptyValue
                ? {
                      field: key,
                      headerName: formatKey(value),
                      flex: 1,
                      minWidth: 275
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
                // eslint-disable-next-line no-prototype-builtins
                if (obj[column.field]?.hasOwnProperty('day_interval') && column.field !== 'date_of_diagnosis') {
                    if (column.field === 'endDate') {
                        const ageInDays = obj[endDate].day_interval - obj[startDate].day_interval;
                        const years = Math.floor(ageInDays / 365);
                        const remainingDays = ageInDays % 365;
                        const months = Math.floor(remainingDays / 30);
                        const days = remainingDays % 30;

                        row[column.field] = `${years}y ${months}m ${days}d`;
                    } else {
                        const ageInDays = obj[column.field].day_interval;
                        const years = Math.floor(ageInDays / 365);
                        const remainingDays = ageInDays % 365;
                        const months = Math.floor(remainingDays / 30);
                        const days = remainingDays % 30;

                        row[column.field] = `${years}y ${months}m ${days}d`;
                    }
                } else if (
                    // eslint-disable-next-line no-prototype-builtins
                    obj[column.field]?.hasOwnProperty('month_interval') &&
                    column.field !== 'date_of_diagnosis'
                ) {
                    if (column.field === endDate) {
                        const ageInMonths = obj[endDate].month_interval - obj[startDate].month_interval;
                        const years = Math.floor(ageInMonths / 12);
                        const remainingMonths = ageInMonths % 12;

                        // Format the years and months into a single string
                        const formattedAge = years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
                        row[column.field] = formattedAge;
                    } else {
                        const ageInMonths = obj[column.field].month_interval;
                        const years = Math.floor(ageInMonths / 12);
                        const remainingMonths = ageInMonths % 12;

                        // Format the years and months into a single string
                        const formattedAge = years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
                        row[column.field] = formattedAge;
                    }
                } else if (column.field === 'date_of_diagnosis') {
                    row[column.field] = ageAtFirstDiagnosis + Math.floor(obj[column.field].month_interval / 12);
                } else {
                    row[column.field] = Array.isArray(obj[column.field]) ? obj[column.field].join(', ') : obj[column.field]; // Add spaces to arrays
                }
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
        // Ignore deps on the next line as it appears to prevent this component from working otherwise
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

            sidebarTitles.push(
                <div key={`${key}-${depth}-${folderDepth}`}>
                    <SubHeader
                        isExpanded={isExpanded}
                        depth={depth}
                        selected={selected === `${key}-${depth}-${folderDepth}`}
                        folderDepth={folderDepth}
                        onClick={() => {
                            toggleSection(key);
                            const idKey = findIdKey(subTableMap[key]);
                            handleTableSet(key, subTableMap[key], idKey);
                            setSelected(`${key}-${depth}-${folderDepth}`);
                        }}
                    >
                        <SubHeaderTypography variant="body1" selected={selected === `${key}-${depth}-${folderDepth}`}>
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

    return <div style={{ marginTop: 12 }}>{createMainSidebarHeaders(sidebar)}</div>;
}

PatientSidebar.propTypes = {
    sidebar: PropTypes.object,
    setColumns: PropTypes.func.isRequired,
    setRows: PropTypes.func.isRequired,
    setTitle: PropTypes.func.isRequired,
    ageAtFirstDiagnosis: PropTypes.number,
    forceSelection: PropTypes.array
};

export default PatientSidebar;
