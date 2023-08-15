import { Button } from '@mui/material';
import PropTypes from 'prop-types';

const ClinicalIngest = ({ setTab }) => (
    // setTab should be a function that sets the tab to the genomic ingest page
    <Button sx={{ position: 'absolute', right: '0.2em', bottom: '0.2em' }} onClick={setTab} variant="contained">
        Next
    </Button>
);

ClinicalIngest.propTypes = {
    setTab: PropTypes.func.isRequired
};

export default ClinicalIngest;
