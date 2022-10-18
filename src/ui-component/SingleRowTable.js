import PropTypes from 'prop-types';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
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

function SingleRowTable({
    dropDownLabel,
    dropDownSelection,
    headerLabels,
    headerWidths,
    stackCells,
    handleRowClick,
    setListOpen,
    isListOpen,
    rows,
    dropDownGroup
}) {
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
                        dropDownItems={rows}
                        selectOption={handleRowClick}
                        dropDownGroup={dropDownGroup}
                    />
                    {Object.entries(stackCells).map(([key, value]) => (
                        <Box key={key}>
                            {value && (
                                <Box mr={1} p={1} sx={{ width: headerWidths[key] }}>
                                    <span style={{ color: theme.palette.primary.main }}>
                                        <b>{headerLabels[key]}</b>
                                    </span>
                                    <br />
                                    <span>{value}</span>
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
    headerLabels: PropTypes.object,
    headerWidths: PropTypes.object,
    stackCells: PropTypes.object,
    handleRowClick: PropTypes.func,
    setListOpen: PropTypes.func,
    isListOpen: PropTypes.bool,
    rows: PropTypes.any,
    dropDownGroup: PropTypes.string
};

export default SingleRowTable;
