import { useEffect, useRef, useState } from 'react';
import { Alert, TextField } from '@mui/material';
import PropTypes from 'prop-types';

function PersistentFile({ file, fileLoader }) {
    // A JSON file input dialog which can maintain its state after unmounting. Optionally validates before upload.
    // Calls "fileLoader" with the file object as argument #1 and the JSON data as argument #2.
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    async function loadFile(file) {
        try {
            const data = await file.text().then((data) => JSON.parse(data));
            if (!(data || data !== undefined)) {
                console.log(`Error parsing uploaded JSON file ${file.name}`);
                setError(`Error parsing uploaded JSON "${file.name}`);
                return;
            }
            fileLoader(file, data);
            setError(null);
        } catch (error) {
            console.log(`Error parsing JSON ${file.name}`);
            console.log(error);
            setError(`Error parsing JSON "${file.name}": ${error.message}`);
            fileRef.current.value = '';
        }
    }

    useEffect(() => {
        if (file && fileRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileRef.current.files = dataTransfer.files;
        }
    });

    return (
        <>
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
        </>
    );
}

PersistentFile.propTypes = {
    fileLoader: PropTypes.func.isRequired,
    file: PropTypes.instanceOf(File)
};

export default PersistentFile;
