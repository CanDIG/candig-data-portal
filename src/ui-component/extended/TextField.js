import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

// mui
import { Box, MenuItem, TextField as MuiTextField, Typography } from '@mui/material';

const PREFIX = 'TextField';

const classes = {
    subLabel: `${PREFIX}-subLabel`
};

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',

    [`& .${classes.subLabel}`]: {
        color: 'inherit'
    }
}));

// ===========================|| TEXTFIELD ||=========================== //

function TextField({ onChange, value, options, multiline, label, subLabel, required = true, ...rest }) {
    const handleChange = (event) => {
        onChange(event.target.value);
    };

    const universalProps = {
        onChange: handleChange,
        value: value || '',
        required,
        inputProps: { id: label && label.replace(/\W/g, '') }
    };

    let textField;
    if (options) {
        textField = (
            <MuiTextField select {...universalProps} {...rest}>
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </MuiTextField>
        );
    } else if (multiline) {
        textField = <MuiTextField multiline minRows={5} {...universalProps} {...rest} />;
    } else {
        textField = <MuiTextField {...universalProps} {...rest} />;
    }

    return (
        <StyledBox>
            {label && (
                <Typography component="label" htmlFor={label.replace(/\W/g, '')}>
                    {label}
                    {subLabel && <span className={classes.subLabel}> {subLabel}</span>}
                    {required && ' *'}
                </Typography>
            )}
            {textField}
        </StyledBox>
    );
}

TextField.propTypes = {
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    subLabel: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    multiline: PropTypes.bool
};

export default TextField;
