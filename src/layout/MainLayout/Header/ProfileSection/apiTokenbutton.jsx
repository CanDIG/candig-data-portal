import { useState } from 'react';
import PropTypes from 'prop-types';

import { Alert, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from '@mui/material';
import PasswordIcon from '@mui/icons-material/Password';

import { fetchRefreshToken } from 'store/api';

// JWT decoder taken from here: https://stackoverflow.com/a/38552302/2148998
// Then ran through prettier a bunch
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        window
            .atob(base64)
            .split('')
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join('')
    );

    return JSON.parse(jsonPayload);
}

function APITokenButton(props) {
    const { classes, customization } = props;
    const [token, setToken] = useState(undefined);
    const [tokenHidden, setTokenHidden] = useState(false);
    const [error, setError] = useState(undefined);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const grabToken = () => {
        setError(false);
        fetchRefreshToken().then((data) => {
            if ('error' in data) {
                setError(data.error);
            } else {
                setToken(data.token);
                setTokenHidden(false);
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
            setTokenHidden(true);
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

    const getTimeout = (token) => new Date(parseJwt(token).exp * 1000).toTimeString();

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
                            {tokenHidden ? token.replaceAll(/./g, '*') : token}
                        </Alert>
                    </Tooltip>
                    <Typography variant="body2" sx={{ marginLeft: '49px' }}>
                        Click to copy (token valid until {getTimeout(token)})
                    </Typography>
                    <Typography variant="body2" className={classes.errorText} sx={{ marginLeft: '49px' }}>
                        Keep this token secure, do not share it with anybody!
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
