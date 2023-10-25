import { makeStyles, styled } from '@mui/styles';
import { Alert, Box, CircularProgress, Grid, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';

import IngestTabPage from 'ui-component/ingest/IngestTabPage';
import ClinicalIngest from 'ui-component/ingest/ClinicalIngest';
import GenomicIngest from 'ui-component/ingest/GenomicIngest';
import PersistentFile from 'ui-component/PersistentFile';
import { ingestClinicalData, ingestGenomicData } from 'store/api';

const IngestTab = styled(Tab)({
    height: '2.75em',
    paddingLeft: '0.77em',
    paddingRight: '0.77em',
    marginBottom: 0,
    borderTopLeftRadius: '0.55em',
    borderTopRightRadius: '0.55em',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'start',
    gap: '0.59em',
    display: 'flex',
    textAlign: 'left',
    color: '#686969',
    fontSize: '1.5em',
    fontFamily: 'Roboto',
    fontWeight: '700',
    wordWrap: 'break-word',
    textTransform: 'none',
    verticalAlign: 'center'
});

function IngestMenu() {
    const IngestStates = {
        PENDING: 0,
        STARTED_CLINICAL: 1,
        STARTED_GENOMIC: 2,
        ERROR: 3,
        SUCCESS: 4
    };
    const [value, setValue] = useState(0);
    const [clinicalFile, setClinicalFile] = useState(undefined);
    const [clinicalData, setClinicalData] = useState(undefined);
    const [genomicData, setGenomicData] = useState(undefined);
    const [genomicFile, setGenomicFile] = useState(undefined);
    const [ingestState, setIngestState] = useState(IngestStates.PENDING);
    const [ingestError, setIngestError] = useState('');

    const useStyles = makeStyles({
        tabActive: {
            border: '0.125vw #2196F3 solid',
            borderBottom: 'none',
            background: '#FFFFFF'
        },
        tabInactive: {
            border: '0.1vw #2196F3 solid',
            borderBottom: '0.15vw #2196F3 solid',
            background: '#F4FAFF'
        }
    });

    const classes = useStyles();

    function getIngestStatusComponent(status) {
        function progressRow(component) {
            return (
                <Grid container direction="row">
                    <Grid item>
                        <CircularProgress sx={{ padding: '0.35em' }} />
                    </Grid>
                    <Grid item xs>
                        {component}
                    </Grid>
                </Grid>
            );
        }

        switch (status) {
            case IngestStates.STARTED_CLINICAL:
                return progressRow(<Alert severity="info">Ingesting clinical data...</Alert>);
            case IngestStates.SUCCESS:
                return <Alert severity="success">Ingest complete!</Alert>;
            case IngestStates.ERROR:
                return <Alert severity="error">Ingest encountered the following error: {ingestError}</Alert>;
            case IngestStates.STARTED_GENOMIC:
                return progressRow(<Alert severity="info">Clinical ingest complete. Beginning genomic ingest...</Alert>);
            default:
                return <Alert severity="info">Nothing to show. (You probably should not be seeing this...)</Alert>;
        }
    }

    function loadClinicalFile(file, data) {
        if (!('donors' in data && Array.isArray(data.donors))) {
            throw Error('Donors key not found in clinical file');
        }
        setClinicalData(data);
        setClinicalFile(file);
    }
    function loadGenomicFile(file, data) {
        setGenomicData(data);
        setGenomicFile(file);
    }

    function beginIngest() {
        console.log('Beginning ingest...');
        setIngestState(IngestStates.STARTED_CLINICAL);
        ingestClinicalData(JSON.stringify(clinicalData)).then((result) => {
            if (result.response_code === 0) {
                setIngestState(IngestStates.STARTED_GENOMIC);
                ingestGenomicData(JSON.stringify(genomicData), clinicalData.donors[0].program_id).then((response) => {
                    if (response.status === 200) {
                        setIngestState(IngestStates.SUCCESS);
                    } else {
                        setIngestError(result.json.result);
                    }
                });
            } else {
                setIngestError(result.result);
            }
        });
    }

    useEffect(() => ingestError && setIngestState(IngestStates.ERROR), [ingestError]);

    function getPage(val) {
        if (val === 0)
            return (
                <ClinicalIngest
                    setTab={() => setValue(1)}
                    fileUpload={<PersistentFile file={clinicalFile} fileLoader={(file, data) => loadClinicalFile(file, data)} />}
                    clinicalData={clinicalData}
                />
            );
        return (
            <GenomicIngest
                beginIngest={() => beginIngest()}
                fileUpload={<PersistentFile file={genomicFile} fileLoader={(file, data) => loadGenomicFile(file, data)} />}
                clinicalData={clinicalData}
                genomicData={genomicData}
            />
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={(_, value) => setValue(value)}
                variant="fullWidth"
                sx={{ width: '100%' }}
                TabIndicatorProps={{
                    style: { display: 'none' }
                }}
                centered
            >
                <IngestTab label="Clinical Ingest" key={0} className={value === 0 ? classes.tabActive : classes.tabInactive} />
                <IngestTab
                    label="Genomic Ingest"
                    key={0}
                    className={value === 1 ? classes.tabActive : classes.tabInactive}
                    disabled={clinicalData === undefined}
                />
            </Tabs>
            <IngestTabPage> {getPage(value)} </IngestTabPage>
            {ingestState !== IngestStates.PENDING && getIngestStatusComponent(ingestState)}
        </Box>
    );
}

export default IngestMenu;
