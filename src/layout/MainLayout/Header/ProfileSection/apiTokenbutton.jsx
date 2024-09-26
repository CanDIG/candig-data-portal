import { useState } from 'react';
import PropTypes from 'prop-types';

import { Alert, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import PasswordIcon from '@mui/icons-material/Password';

import { fetchRefreshToken } from 'store/api';

function APITokenButton(props) {
    const { classes, customization } = props;
    const [token, setToken] = useState(undefined);
    const [error, setError] = useState(undefined);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const grabToken = () => {
        setError(false);
        fetchRefreshToken().then((data) => {
            if ('error' in data) {
                setError(data.error);
            } else {
                setToken(data.token);
            }
        });
    };

    function openTooltip() {
        setTooltipOpen(true);
        setTimeout(() => {
            setTooltipOpen(false);
        }, 3000);
    }

    function fallbackCopyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            openTooltip();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        } finally {
            document.body.removeChild(textarea);
        }
    }

    const copyToken = () => {
        try {
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(token)
                    .then(() => openTooltip())
                    .catch(() => {
                        fallbackCopyTextToClipboard(token);
                    });
            } else {
                fallbackCopyTextToClipboard(token);
            }
        } catch (err) {
            console.error('Error copying token:', err);
        }
    };

    return (
        <>
            <ListItemButton className={classes.listItem} sx={{ borderRadius: `${customization.borderRadius}px` }} onClick={grabToken}>
                <ListItemIcon>
                    <PasswordIcon stroke={1.5} size="1.3rem" />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body2">Get API Token</Typography>} />
            </ListItemButton>
            {token ? (
                <>
                    <Tooltip
                        title="Token Copied!"
                        placement="top-end"
                        PopperProps={{
                            disablePortal: true
                        }}
                        onClose={() => setTooltipOpen(false)}
                        open={tooltipOpen}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                    >
                        <Alert severity="success" onClick={copyToken}>
                            {token}
                        </Alert>
                    </Tooltip>
                    <Typography variant="body2" sx={{ marginLeft: '49px' }}>
                        Click to copy
                    </Typography>
                </>
            ) : (
                ' '
            )}
            {error ? <Alert severity="error">{error}</Alert> : ' '}
        </>
    );
}

APITokenButton.propTypes = {
    classes: PropTypes.object,
    customization: PropTypes.object
};

export default APITokenButton;
