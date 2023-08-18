import { useEffect, useRef, useState } from 'react';
import { Alert, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const PersistentFile = ({ file, setFile, validate = true }) => {
    // A JSON file input dialog which can maintain its state after unmounting. Optionally validates before upload.
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    async function loadFile(file) {
        try {
            if (validate) {
                const result = await file.text().then((data) => JSON.parse(data) && data !== null && data !== undefined);
                if (!result) {
                    console.log(`Error parsing uploaded JSON file ${file.name}`);
                    setError(`Error parsing uploaded JSON "${file.name}`);
                    return;
                }
            }
        } catch (error) {
            console.log(`Error parsing JSON ${file.name}`);
            console.log(error);
            setError(`Error parsing JSON "${file.name}": ${error.message}`);
            fileRef.current.value = '';
            return;
        }
        setFile(file);
        setError(null);
    }

    useEffect(() => {
        if (file && fileRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileRef.current.files = dataTransfer.files;
        }
    });

    return (
        <div>
            <TextField
                sx={{ width: '100%' }}
                variant="outlined"
                type="file"
                inputProps={{ accept: 'application/json', ref: fileRef }}
                onChange={(event) => loadFile(event.target.files[0])}
            />
            {error !== null && (
                <Alert sx={{ marginBottom: 0 }} severity="error">
                    {error}
                </Alert>
            )}
        </div>
    );
};

PersistentFile.propTypes = {
    setFile: PropTypes.func.isRequired,
    file: PropTypes.instanceOf(File),
    validate: PropTypes.bool
};

export default PersistentFile;
