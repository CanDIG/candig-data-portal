import * as React from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { Grid, Box } from '@material-ui/core';

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
    }
});

function DropDown({ dropDownLabel, currentSelection, selectOption, setListOpen, isListOpen, rows }) {
    const theme = useTheme();
    const classes = useStyles();

    function returnIds(rows) {
        return rows.map((row) => (
            <button className={classes.dropdownItem} type="button" onClick={() => selectOption(row)} key={row.id}>
                {row.id}
            </button>
        ));
    }

    return (
        <Grid sx={{ width: '110px' }}>
            <Box mr={1} p={1} onClick={() => setListOpen(!isListOpen)} type="button">
                <span style={{ color: theme.palette.primary.main }}>
                    <b>{dropDownLabel}</b>
                </span>
                <br />
                <span>
                    {currentSelection}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-chevron-down"
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                        stroke="#597e8d"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </Box>
            {isListOpen && (
                <Grid
                    container
                    direction="column"
                    className="dropdown-menu"
                    aria-labelledby="actions"
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        border: '1px grey solid',
                        borderRadius: 2,
                        width: 'max-content'
                    }}
                >
                    {returnIds(rows)}
                </Grid>
            )}
        </Grid>
    );
}

DropDown.propTypes = {
    setListOpen: PropTypes.func,
    isListOpen: PropTypes.bool,
    rows: PropTypes.array,
    dropDownLabel: PropTypes.string,
    currentSelection: PropTypes.string,
    selectOption: PropTypes.func
};

export default DropDown;
