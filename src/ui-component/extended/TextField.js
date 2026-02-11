import { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';

// mui
import { Box, Checkbox, FormControlLabel, MenuItem, Switch, TextField as MuiTextField, Typography } from '@mui/material';

const PREFIX = 'TextField';

const classes = {
    input: `${PREFIX}-input`
};

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    '& .MuiFormHelperText-root': {
        color: theme.palette.grey[900],
        textAlign: 'right'
    },

    [`& .${classes.input}`]: {
        '&.Mui-disabled': {
            color: theme.palette.grey[900],
            WebkitTextFillColor: theme.palette.grey[900]
        }
    }
}));

const StyledFormControlLabel = styled(FormControlLabel)(() => ({
    '& .MuiFormControlLabel-asterisk': {
        display: 'none'
    }
}));

// ===========================|| TEXTFIELD ||=========================== //

function TextField({
    label,
    onChange,
    checkbox,
    hidden,
    id,
    maxWords,
    multiline,
    options,
    required = true,
    subLabel,
    sx,
    toggle,
    value,
    ...rest
}) {
    const [wordCount, setWordCount] = useState(0);

    if (hidden) {
        return null;
    }

    if (checkbox || toggle) {
        const handleChange = (_, checked) => {
            onChange(checked);
        };

        return (
            <StyledFormControlLabel
                label={<Typography>{label}</Typography>}
                control={checkbox ? <Checkbox required={required} /> : <Switch required={required} />}
                onChange={handleChange}
                checked={value || false}
                sx={sx}
                className={classes.formControl}
            />
        );
    }

    let handleChange;
    if (maxWords) {
        handleChange = (event) => {
            const newValue = event.target.value;
            const numWords = (newValue.match(/\S+/g) || []).length;
            if (numWords <= maxWords) {
                // Make sure there can only be one trailing string
                onChange(newValue.replace(/\s+$/, ' '));
                setWordCount(numWords);
            } else {
                setWordCount(maxWords);
            }
        };
    } else {
        handleChange = (event) => {
            onChange(event.target.value);
        };
    }

    const universalProps = {
        onChange: handleChange,
        value: value || '',
        required,
        helperText: maxWords && `${wordCount} / ${maxWords} words`,
        inputProps: {
            id: id || (label && label.replace(/\W/g, '')),
            className: classes.input
        },
        sx,
        ...rest
    };

    let textField;
    if (options) {
        textField = (
            <MuiTextField select {...universalProps}>
                {options.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </MuiTextField>
        );
    } else if (multiline) {
        textField = <MuiTextField multiline minRows={5} maxRows={10} {...universalProps} />;
    } else {
        textField = <MuiTextField {...universalProps} />;
    }

    return (
        <StyledBox>
            {label && (
                <Typography component="label" htmlFor={id || label.replace(/\W/g, '')}>
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
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checkbox: PropTypes.bool,
    hidden: PropTypes.bool,
    id: PropTypes.string,
    maxWords: PropTypes.number,
    multiline: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.string),
    required: PropTypes.bool,
    subLabel: PropTypes.string,
    sx: PropTypes.object,
    toggle: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

export default TextField;
