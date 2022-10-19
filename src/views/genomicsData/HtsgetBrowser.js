import { useState, useEffect } from 'react';
import { Box, Button, FormControl, Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';

import { MultiSelect } from 'react-multi-select-component';
import LightCard from 'views/dashboard/Default/LightCard';
import AlertComponent from 'ui-component/AlertComponent';

import HtsgetInstance from 'ui-component/IGV/HtsgetInstance';
import { fetchKatsu } from 'store/api';

import { LoadingIndicator, usePromiseTracker, trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';

// Assets
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';

import 'assets/css/VariantsSearch.css';

function HtsgetBrowser() {
    const [isLoading, setLoading] = useState(true);
    // const events = useSelector((state) => state);
    const [BamCount, setBamCount] = useState('');
    const [VcfCount, setVcfCount] = useState('');
    const { promiseInProgress } = usePromiseTracker();
    const options = useState([]);
    const [selected, setSelected] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedBamIds, setSelectedBamIds] = useState([]);
    const [selectedVcfIds, setSelectedVcfIds] = useState([]);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('');

    useEffect(() => {
        setSelected([]);
        options.length = 0;
        setSelectedBamIds([]);
        setSelectedVcfIds([]);
        setLoading(false);

        // Get a list of genomics files available
        trackPromise(
            fetchKatsu('/api/genomicsreports')
                .then((data) => {
                    // TODO: get a list of ids of genomics files from API above
                    // Or any other APIs that can provide a list of IDs
                    // Note: if only VCF files are served, then the following TODOs concerning BAM files
                    // can all be removed.
                })
                .catch(() => {
                    setBamCount('Not Available');
                    setVcfCount('Not Available');
                })
        );
    }, [options]);

    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission

        // TODO: Dynamically create a list of IDs that have been selected
        // TODO: And pass this list of IDs into htsgetInstance
        setSelectedBamIds([]);
        setSelectedVcfIds([]);
    };

    return (
        <>
            <MainCard title="Htsget Browser" sx={{ minHeight: 830, position: 'relative' }}>
                <AlertComponent
                    open={open}
                    setOpen={setOpen}
                    text={alertMessage}
                    severity={alertSeverity}
                    variant="filled"
                    fontColor={alertSeverity === 'error' ? 'white' : 'black'}
                />
                <Grid container direction="column" className="content">
                    <Grid container direction="row" justifyContent="center" spacing={2} p={2}>
                        <Grid item sm={12} xs={12} md={4} lg={4}>
                            {promiseInProgress === true ? (
                                <LoadingIndicator />
                            ) : (
                                <LightCard
                                    isLoading={isLoading}
                                    header="VCFs"
                                    value={VcfCount}
                                    icon={<MapIcon fontSize="inherit" />}
                                    color="primary"
                                />
                            )}
                        </Grid>
                        <Grid item sm={12} xs={12} md={4} lg={4}>
                            {promiseInProgress === true ? (
                                <LoadingIndicator />
                            ) : (
                                <LightCard
                                    isLoading={isLoading}
                                    header="BAMs"
                                    value={BamCount}
                                    icon={<DescriptionIcon fontSize="inherit" />}
                                    color="secondary"
                                />
                            )}
                        </Grid>
                    </Grid>

                    <form onSubmit={formHandler} style={{ justifyContent: 'center' }}>
                        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} p={2}>
                            <Grid item>
                                {options.length > 0 && (
                                    <FormControl>
                                        <Grid container direction="row" alignItems="center">
                                            <Box mr={2}>
                                                <p>Genomics Files</p>
                                            </Box>
                                            <MultiSelect // Width set in CSS
                                                options={options}
                                                value={selected}
                                                onChange={setSelected}
                                                labelledBy="Genomics Files"
                                            />
                                        </Grid>
                                    </FormControl>
                                )}
                            </Grid>

                            <Grid item>
                                <FormControl>
                                    <Button type="submit" variant="contained">
                                        View
                                    </Button>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>

                    <HtsgetInstance BamIdList={selectedBamIds} VcfIdList={selectedVcfIds} />
                </Grid>
            </MainCard>
        </>
    );
}

export default HtsgetBrowser;
