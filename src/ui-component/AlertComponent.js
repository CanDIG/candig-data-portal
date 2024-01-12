import PropTypes from 'prop-types';

import { Alert, Collapse } from '@mui/material';

function AlertComponent({ open, setOpen, text, fontColor, severity, variant }) {
    return (
        <Collapse in={open}>
            <Alert
                onClose={() => {
                    setOpen(false);
                }}
                onClick={() => {
                    setOpen(false);
                }}
                severity={severity}
                variant={variant}
                sx={{ color: fontColor }}
            >
                {text}
            </Alert>
        </Collapse>
    );
}

AlertComponent.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
    text: PropTypes.string,
    fontColor: PropTypes.string,
    severity: PropTypes.string,
    variant: PropTypes.string
};

AlertComponent.defaultProps = {
    open: false,
    fontColor: 'black',
    variant: 'filled'
};

export default AlertComponent;
