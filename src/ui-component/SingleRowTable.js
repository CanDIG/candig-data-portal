import * as React from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { Box } from '@material-ui/core';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';

// Project imports
import DropDown from './DropDown';

const useStyles = makeStyles({
    dropdownItem: {
        background: 'white',
        paddingRight: '1.25em',
        paddingLeft: '1.25em',
        border: 'none',
        width: 'fit-content(5em)',
        '&:hover': {
            background: '#2196f3',
            color: 'white'
        }
    },
    mobileRow: {
        width: '700px'
    },
    scrollbar: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: '0.4em',
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)'
        }
    }
});

function SingleRowTable({ dropDownLabel, dropDownSelection, headerLabels, stackCells, handleRowClick, setListOpen, isListOpen, rows }) {
    const theme = useTheme();
    const classes = useStyles();

    return (
        <TableContainer className={[classes.mobileRow, classes.scrollbar]}>
            <Table>
                <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                    <DropDown
                        setListOpen={setListOpen}
                        isListOpen={isListOpen}
                        dropDownLabel={dropDownLabel}
                        currentSelection={dropDownSelection}
                        rows={rows}
                        selectOption={handleRowClick}
                    />
                    {headerLabels.map((header, index) => (
                        <Box>
                            {stackCells[index] && (
                                <Box mr={1} p={1}>
                                    <span style={{ color: theme.palette.primary.main }}>
                                        <b>{header}</b>
                                    </span>
                                    <br />
                                    <span>{stackCells[index]}</span>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Table>
        </TableContainer>
    );
}

SingleRowTable.propTypes = {
    dropDownLabel: PropTypes.string,
    dropDownSelection: PropTypes.string,
    headerLabels: PropTypes.array,
    stackCells: PropTypes.array,
    handleRowClick: PropTypes.func,
    setListOpen: PropTypes.func,
    isListOpen: PropTypes.bool,
    rows: PropTypes.any
};

export default SingleRowTable;
