import { useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

const PersistentFile = ({ file, setFile }) => {
    const fileRef = useRef(null);

    useEffect(() => {
        if (file && fileRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileRef.current.files = dataTransfer.files;
        }
    });

    return (
        <TextField
            sx={{ width: '100%' }}
            variant="outlined"
            type="file"
            inputProps={{ accept: 'application/json', ref: fileRef }}
            onChange={(event) => setFile(event.target.files[0])}
        />
    );
};

PersistentFile.propTypes = {
    file: PropTypes.instanceOf(File).isRequired,
    setFile: PropTypes.func.isRequired
};

export default PersistentFile;
