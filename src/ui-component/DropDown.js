import * as React from 'react';
import PropTypes from 'prop-types';

// mui
import { useTheme, makeStyles } from '@mui/system';
import { Grid, Box } from '@mui/material';

const useStyles = makeStyles({
    dropdownItem: {
        background: 'white',
        textAlign: 'left',
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

function DropDown({ dropDownLabel, currentSelection, selectOption, setListOpen, isListOpen, dropDownItems, dropDownGroup }) {
    const theme = useTheme();
    const classes = useStyles();
    const ref = React.useRef(null);

    React.useEffect(() => {
        const closeDropDowns = (e) => {
            if (isListOpen && !ref.current.contains(e.target) && ref.current) {
                setListOpen(false);
            }
        };
        document.addEventListener('mousedown', closeDropDowns);
        return () => {
            document.removeEventListener('mousedown', closeDropDowns);
        };
    }, [isListOpen, setListOpen]);

    function returnIds(rows) {
        return rows.map((row) => (
            <button className={classes.dropdownItem} type="button" onClick={() => selectOption(row)} key={row.id}>
                {row.id}
            </button>
        ));
    }

    function returnListItem(dropDownItems) {
        const content = [];
        Object.entries(dropDownItems).forEach(([key, value]) => {
            content.push(
                <button
                    className={classes.dropdownItem}
                    type="button"
                    onClick={() => selectOption(dropDownGroup, dropDownItems[key])}
                    key={key}
                >
                    {value}
                </button>
            );
        });
        return content;
    }

    return (
        <Grid sx={{ width: '125px' }} ref={ref}>
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
                    {dropDownGroup === 'PATIENT' ? returnIds(dropDownItems) : returnListItem(dropDownItems)}
                </Grid>
            )}
        </Grid>
    );
}

DropDown.propTypes = {
    setListOpen: PropTypes.func,
    isListOpen: PropTypes.bool,
    dropDownItems: PropTypes.any,
    dropDownLabel: PropTypes.string,
    currentSelection: PropTypes.string,
    selectOption: PropTypes.func,
    dropDownGroup: PropTypes.string
};

export default DropDown;
