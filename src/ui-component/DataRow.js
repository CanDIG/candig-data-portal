import React from 'react';
import PropTypes from 'prop-types';

import { Box, Divider, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/system';

function makeField(lab, val) {
    return {
        label: lab,
        value: val
    };
}

const PREFIX = 'UIComponentDataRow';

const classes = {
    dropdownItem: `${PREFIX}-dropdownItem`,
    rowText: `${PREFIX}-rowText`,
    container: `${PREFIX}-container`,
    locked: `${PREFIX}-locked`,
    button: `${PREFIX}-button`,
    divider: `${PREFIX}-divider`,
    dataBox: `${PREFIX}-dataBox`,
    label: `${PREFIX}-label`
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.dataBox}`]: {
        maxHeight: 'none',
        height: 'fit-content',
        paddingTop: '0.75em',
        paddingBottom: '0.75em',
        marginTop: '3em'
    },
    [`& .${classes.rowText}`]: {
        color: 'black'
    },
    [`& .${classes.container}`]: {
        minHeight: 40,
        marginRight: 0
    },
    [`& .${classes.locked}`]: {
        backgroundColor: theme.palette.action.disabledBackground
    },
    [`& .${classes.button}`]: {
        // Right-aligned
        float: 'right',
        marginLeft: 'auto'
    },
    [`& .${classes.divider}`]: {
        borderColor: theme.palette.primary.main,
        marginTop: '0.25em',
        marginBottom: '0.25em'
    },
    [`& .${classes.label}`]: {
        marginTop: '-3.5em',
        paddingBottom: '2em',
        color: 'black'
    }
}));

function DataRow(props) {
    const { fields, itemSize, rowWidth } = props;
    const theme = useTheme();
    const primaryField = fields.shift();

    /* const avatarProps = locked
        ? {
              // If we're locked out, gray out the avatar
              sx: { bgcolor: theme.palette.action.disabled }
          }
        : {}; */

    return (
        <StyledBox
            className={classes.dataBox}
            sx={{
                // These properties aren't working in useStyles for some reason...
                border: 1,
                borderRadius: 2,
                boxShadow: 2,
                borderColor: theme.palette.primary.main,
                display: 'flex',
                width: rowWidth
            }}
            pr={2}
        >
            <Grid container justifyContent="flex-start" alignItems="center" className={classes.container}>
                <Grid item xs>
                    <Typography className={classes.label} align="center">
                        <b>{primaryField.label}</b>
                    </Typography>
                    <Typography align="center" variant="h6" className={classes.rowText} sx={{ fontSize: itemSize }}>
                        {primaryField.value}
                    </Typography>
                </Grid>
                {fields.map((field, idx) => (
                    <React.Fragment key={idx}>
                        <Divider flexItem orientation="vertical" className={classes.divider} />
                        <Grid item xs>
                            <Typography className={classes.label} align="center">
                                <b>{field.label}</b>
                            </Typography>
                            <Typography align="center" variant="body1" className={classes.rowText} sx={{ fontSize: itemSize }}>
                                {field.value}
                            </Typography>
                        </Grid>
                    </React.Fragment>
                ))}
            </Grid>
        </StyledBox>
    );
}

DataRow.defaultProps = {
    itemSize: '16px',
    rowWidth: '100%'
};

DataRow.propTypes = {
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired
        })
    ).isRequired,
    itemSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rowWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export { makeField, DataRow };
