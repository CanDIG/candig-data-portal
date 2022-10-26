import { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid, Button, FormControl, InputLabel, Input, NativeSelect, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import VariantsTable from 'ui-component/Tables/VariantsTable';
import { SearchIndicator } from 'ui-component/LoadingIndicator/SearchIndicator';
import AlertComponent from 'ui-component/AlertComponent';
import { ListOfReferenceNames } from 'store/constant';
import { trackPromise, usePromiseTracker } from 'ui-component/LoadingIndicator/LoadingIndicator';
import 'assets/css/VariantsSearch.css';
import { searchVariant } from 'store/api';
import IGViewer from './IGViewer';
import DropDown from '../../ui-component/DropDown';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';

// Styles
const useStyles = makeStyles({
    dropdownItem: {
        background: 'white',
        paddingRight: '1.25em',
        paddingLeft: '1.25em',
        border: 'none',
        width: 'fit-content(5em)',
        '&:hover': {
            background: '#2196f3',
            color: 'white'
        }
    },
    mobileRow: {
        width: '700px'
    },
    scrollbar: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: '0.4em',
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)'
        }
    }
});

function VariantsSearch() {
    const [isLoading, setLoading] = useState(true);
    const classes = useStyles();
    const theme = useTheme();
    const events = useSelector((state) => state);
    const [rowData, setRowData] = useState([]);
    const [displayVariantsTable, setDisplayVariantsTable] = useState(false);
    const { promiseInProgress } = usePromiseTracker();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('warning');
    const [isIGVWindowOpen, setIsIGVWindowOpen] = useState(false);
    const [showIGVButton, setShowIGVButton] = useState(false);
    const [IGVOptions, setIGVOptions] = useState({});
    const [variantSearchOptions, setVariantSearchOptions] = useState({});
    const clinicalSearch = useSelector((state) => state.customization.clinicalSearch);

    /*
    Build the dropdown for chromosome
    * @param {None}
    * Return a list of options with chromosome
    */
    function chrSelectBuilder() {
        const refNameList = [];
        ListOfReferenceNames.forEach((refName) => {
            refNameList.push(
                <option key={refName} value={refName}>
                    {refName}
                </option>
            );
        });
        return refNameList;
    }

    useEffect(() => {
        setLoading(false);
        setDisplayVariantsTable(false);
    }, []);

    // get patient data from redux store and filter out empty the genomicId
    let patientList = [];
    if (Object.keys(clinicalSearch.selectedClinicalSearchResults).length !== 0) {
        patientList = clinicalSearch.selectedClinicalSearchResults.filter((patient) => patient.genomicID !== 'NA');
    }

    /**
     * This function handles the Search button
     * It calls the searchVariant function from api.js according to the chromosome and position
     * then compares the result with the patientList genomicID to find the matching patient
     */
    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission
        setDisplayVariantsTable(false);
        const referenceName = e.target.genome.value;
        const chromosome = e.target.chromosome.value;
        const start = e.target.start.value;
        const end = e.target.end.value;
        setVariantSearchOptions({ referenceName, chromosome, start, end });
        trackPromise(
            searchVariant(chromosome, start, end)
                .then((response) => {
                    if (Object.keys(response).length === 0) {
                        setAlertMessage('No variants found');
                        setAlertSeverity('warning');
                        setOpen(true);
                    } else {
                        const variantList = response.results.map((result) => ({
                            genomicId: result.id,
                            referenceName: result.reference_genome,
                            variantCount: result.variantcount,
                            url: result.htsget.urls[0].url
                        }));
                        const patientVariantList = [];
                        const displayData = [];
                        for (let i = 0; i < variantList.length; i += 1) {
                            for (let j = 0; j < patientList.length; j += 1) {
                                if (variantList[i].genomicId === patientList[j].genomicId) {
                                    patientVariantList.push({
                                        patientId: patientList[j].id,
                                        genomicId: variantList[i].genomicId,
                                        referenceName: variantList[i].referenceName,
                                        variantCount: variantList[i].variantCount,
                                        url: variantList[i].url
                                    });
                                    displayData.push({
                                        patientId: patientList[j].id,
                                        genomicSampleId: variantList[i].genomicId,
                                        variantCount: variantList[i].variantCount,
                                        VCFFile: variantList[i].url
                                    });

                                    break; // should have only 1 match, so we can break here
                                }
                            }
                        }
                        setRowData(displayData);
                        setDisplayVariantsTable(true);
                    }
                })
                .catch((error) => {
                    setAlertMessage(error.message);
                    setAlertSeverity('error');
                    setOpen(true);
                }),
            'table'
        );
    };

    const toggleIGVWindow = () => {
        setIsIGVWindowOpen(!isIGVWindowOpen);
    };

    /**
     * This function keeps track of the selected row in the table
     * then it creates the IGV options to send to the IGV window
     */
    const onCheckboxSelectionChanged = (value) => {
        if (value.length === 0) {
            setShowIGVButton(false);
        } else {
            setShowIGVButton(true);
        }
        const trackList = [];
        for (let i = 0; i < value.length; i += 1) {
            trackList.push({
                name: value[i]['Patient ID'],
                type: 'variant',
                format: 'vcf',
                url: value[i]['VCF File']
            });
        }
        const options = {
            // TODO: replace the dummy URL with the actual URL
            reference: {
                id: 'hg38',
                fastaURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/1kg_v37/human_g1k_v37_decoy.fasta', // dummy URL
                cytobandURL: 'https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/b37/b37_cytoband.txt' // dummy URL
            },
            locus: `${variantSearchOptions.chromosome}:${variantSearchOptions.start}-${variantSearchOptions.end}`,
            tracks: trackList
        };
        setIGVOptions(options);
    };

    return (
        <>
            <MainCard
                title="Variants Search"
                sx={{ minHeight: 830, position: 'relative', borderRadius: events.customization.borderRadius * 0.25 }}
            >
                <AlertComponent
                    open={open}
                    setOpen={setOpen}
                    text={alertMessage}
                    severity={alertSeverity}
                    variant="filled"
                    fontColor={alertSeverity === 'error' ? 'white' : 'black'}
                />
                <Grid container direction="row">
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
                        <Box mr={1} p={1} sx={{ width: 50 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Sex</b>
                            </span>
                            <br />
                            <span>
                                {clinicalSearch.clinicalSearchDropDowns.selectedSex
                                    ? clinicalSearch.clinicalSearchDropDowns.selectedSex
                                    : 'All'}
                            </span>
                        </Box>
                        <Box mr={1} p={1} sx={{ width: 150 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Cancer Type</b>
                            </span>
                            <br />
                            <span>
                                {clinicalSearch.clinicalSearchDropDowns.selectedCancerType
                                    ? clinicalSearch.clinicalSearchDropDowns.selectedCancerType
                                    : 'All'}
                            </span>
                        </Box>
                        <Box mr={1} p={1} sx={{ width: 125 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Body Site</b>
                            </span>
                            <br />
                            <span>
                                {clinicalSearch.clinicalSearchDropDowns.selectedConditions
                                    ? clinicalSearch.clinicalSearchDropDowns.selectedConditions
                                    : 'All'}
                            </span>
                        </Box>
                        <Box mr={1} p={1} sx={{ width: 125 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Medications</b>
                            </span>
                            <br />
                            <span>
                                {clinicalSearch.clinicalSearchDropDowns.selectedMedications
                                    ? clinicalSearch.clinicalSearchDropDowns.selectedMedications
                                    : 'All'}
                            </span>
                        </Box>
                    </Stack>
                </Grid>
                <Grid container direction="column" className="content">
                    <form onSubmit={formHandler} style={{ justifyContent: 'center' }}>
                        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} p={2}>
                            <Grid item sx={{ minWidth: 150 }}>
                                <FormControl fullWidth variant="standard">
                                    <InputLabel id="ref-gene-label">Reference Genome</InputLabel>
                                    <NativeSelect required id="genome">
                                        <option value="gh38">gh38</option>
                                        <option value="gh37">gh37</option>
                                    </NativeSelect>
                                </FormControl>
                            </Grid>
                            <Grid item sx={{ minWidth: 150 }}>
                                <FormControl fullWidth variant="standard">
                                    <InputLabel id="chr-label">Chromosome</InputLabel>
                                    <NativeSelect required id="chromosome">
                                        {chrSelectBuilder()}
                                    </NativeSelect>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <InputLabel for="start">Start</InputLabel>
                                    <Input required type="number" id="start" />
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <InputLabel for="end">End</InputLabel>
                                    <Input required type="number" id="end" />
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                    >
                                        Search
                                    </Button>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <Button
                                        variant="contained"
                                        disabled={!showIGVButton}
                                        sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                        onClick={toggleIGVWindow}
                                    >
                                        View in IGV
                                    </Button>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <Button
                                        variant="contained"
                                        sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                        onClick={() => {
                                            alert('This feature is not available yet');
                                        }}
                                    >
                                        View in cBioPortal
                                    </Button>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <Button
                                        variant="contained"
                                        sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                        onClick={() => {
                                            alert('This feature is not available yet');
                                        }}
                                    >
                                        Data Analysis
                                    </Button>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>

                    {displayVariantsTable ? (
                        <VariantsTable rowData={rowData} onChange={onCheckboxSelectionChanged} />
                    ) : (
                        <SearchIndicator area="table" />
                    )}

                    {isIGVWindowOpen && <IGViewer closeWindow={toggleIGVWindow} options={IGVOptions} />}
                </Grid>
            </MainCard>
        </>
    );
}

export default VariantsSearch;
