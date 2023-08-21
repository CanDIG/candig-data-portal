import { makeStyles, styled } from '@mui/styles';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import IngestTabPage from 'ui-component/ingest/IngestTabPage';
import ClinicalIngest from 'ui-component/ingest/ClinicalIngest';
import GenomicIngest from 'ui-component/ingest/GenomicIngest';
import PersistentFile from 'ui-component/PersistentFile';

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
    const [value, setValue] = useState(0);
    const [clinicalFile, setClinicalFile] = useState(undefined);
    const [clinicalData, setClinicalData] = useState(undefined);
    const [genomicData, setGenomicData] = useState(undefined);
    const [genomicFile, setGenomicFile] = useState(undefined);
    const setTab = (event, val) => {
        setValue(val);
    };

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
                beginIngest={() => {}}
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
                onChange={setTab}
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
        </Box>
    );
}

export default IngestMenu;