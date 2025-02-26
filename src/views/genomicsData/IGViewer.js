import { useState } from 'react';

import { Alert, Snackbar } from '@mui/material';

import NewWindow from 'react-new-window';
import CramVcfInstance from 'ui-component/IGV/CramVcfInstance';
import PropTypes from 'prop-types';

function IGViewer({ closeWindow, options }) {
    const [open, setOpen] = useState(false);
    const onClosed = () => {
        closeWindow();
    };

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity="error" sx={{ width: '100%' }}>
                    Please allow popups for this website
                </Alert>
            </Snackbar>
            <NewWindow
                title="Integrative Genomics Viewer"
                onUnload={onClosed}
                onBlock={() => setOpen(true)}
                features={{
                    outerHeight: '100%',
                    outerWidth: '100%'
                }}
            >
                <CramVcfInstance options={options} />
            </NewWindow>
        </>
    );
}

IGViewer.propTypes = {
    closeWindow: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired
};

export default IGViewer;
