import { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Grid, Button, FormControl, InputLabel, Input, NativeSelect } from '@mui/material';
import { useSelector } from 'react-redux';
import VariantsTable from 'ui-component/Tables/VariantsTable';
import { SearchIndicator } from 'ui-component/LoadingIndicator/SearchIndicator';
import AlertComponent from 'ui-component/AlertComponent';
import { ListOfReferenceNames } from 'store/constant';
import { trackPromise, usePromiseTracker } from 'ui-component/LoadingIndicator/LoadingIndicator';
import 'assets/css/VariantsSearch.css';
import { searchVariant, getVariantSearchTable } from 'store/api';
import IGViewer from './IGViewer';

function VariantsSearch() {
    const [isLoading, setLoading] = useState(true);
    const events = useSelector((state) => state);
    const [rowData, setRowData] = useState([]);
    const [displayVariantsTable, setDisplayVariantsTable] = useState(false);
    const { promiseInProgress } = usePromiseTracker();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('warning');
    const [isIGVWindowOpen, setIsIGVWindowOpen] = useState(false);
    const [showIGVButton, setShowIGVButton] = useState(false);
    const [IGVData, setIGVData] = useState({});

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

    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission
        setDisplayVariantsTable(false);
        // call api to fetch variant sets here???
        // step 1: get the patient id list from redux
        const patientIdList = events.patientIdList;
        // step 2: fetch the variant sets from api
        const referenceName = e.target.genome.value;
        const chromosome = e.target.chromosome.value;
        const start = e.target.start.value;
        const end = e.target.end.value;
        trackPromise(
            searchVariant(referenceName, chromosome, start, end, patientIdList)
                .then((response) => {
                    if (response.length === 0) {
                        setAlertMessage('No variants found');
                        setAlertSeverity('warning');
                        setOpen(true);
                    } else {
                        console.log(`response: ${response}`);
                        // call katsu api to get the patient ID, genomic sample ID that
                        // match position and vcf file
                        getVariantSearchTable()
                            .then((tableResponse) => {
                                console.log(`tableResponse: ${tableResponse}`);
                                setRowData(tableResponse);
                                setDisplayVariantsTable(true);
                            })
                            .catch((error) => {
                                console.log(error);
                                setAlertMessage('Error fetching variant search table');
                                setAlertSeverity('error');
                                setOpen(true);
                            });
                    }
                })
                .catch((error) => {
                    setAlertMessage(error.message);
                    setAlertSeverity('error');
                    setOpen(true);
                })
        );
    };

    const toggleIGVWindow = () => {
        setIsIGVWindowOpen(!isIGVWindowOpen);
    };

    const onCheckboxSelectionChanged = (value) => {
        console.log(value);
        if (value.length === 0) {
            setShowIGVButton(false);
        } else {
            setShowIGVButton(true);
        }
        // TODO: replace this data with data from value
        const data = {
            genome: 'hg38',
            tracks: {
                name: 'HG00103',
                url: 'https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram',
                indexURL:
                    'https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai',
                format: 'cram'
            }
        };
        setIGVData(data);
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

                    {isIGVWindowOpen && <IGViewer closeWindow={toggleIGVWindow} data={IGVData} />}
                </Grid>
            </MainCard>
        </>
    );
}

export default VariantsSearch;
