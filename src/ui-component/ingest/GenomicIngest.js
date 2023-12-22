import { Button, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { makeField, DataRow } from 'ui-component/DataRow';
import { makeStyles } from '@mui/system';
import { useEffect, useState } from 'react';

const GenomicIngest = ({ beginIngest, fileUpload, clinicalData, genomicData }) => {
    const [ingestButtonEnabled, setIngestButtonEnabled] = useState(false);

    const cohort = [
        makeField('Cohort', clinicalData.donors[0].program_id),
        makeField('Clinical Patients', clinicalData.donors.length),
        makeField('Read Access', '1')
    ];

    const useStyles = makeStyles({
        titleText: {
            color: 'black',
            fontSize: '1.5em',
            fontFamily: 'Roboto'
        },
        bodyText: {
            color: 'black',
            fontSize: '1em',
            fontFamily: 'Catamaran'
        },
        ingestButton: {
            backgroundColor: '#37CA50',
            width: '7em',
            height: '3em'
        },
        ingestButtonDisabled: {
            backgroundColor: 'grey',
            '&:hover': {
                backgroundColor: 'grey'
            }
        }
    });
    const classes = useStyles();

    useEffect(() => genomicData !== undefined && genomicData !== null && setIngestButtonEnabled(true), [genomicData]);

    return (
        <>
            <Grid container direction="column" sx={{ flexGrow: 1 }} spacing={4}>
                <Grid item>
                    <Typography align="left" className={classes.titleText}>
                        <b>Cohort for ingestion</b>
                    </Typography>
                    <DataRow rowWidth="100%" itemSize="0.9em" fields={cohort} />
                </Grid>
                <Grid item width="100%">
                    <Typography align="left" className={classes.titleText}>
                        <b>Upload genomic sample info</b>
                    </Typography>
                    <Grid container sx={{ marginTop: '0.5em', marginLeft: '1em' }} direction="row" alignItems="center" spacing={2}>
                        <Grid item>
                            <Typography align="left" className={classes.bodyText}>
                                <b>Genomic data:</b>
                            </Typography>
                        </Grid>
                        <Grid item>{fileUpload}</Grid>
                    </Grid>
                </Grid>
                <Grid item align="center">
                    <Button
                        className={classes.ingestButton + (ingestButtonEnabled ? '' : ` ${classes.ingestButtonDisabled}`)}
                        onClick={() => {
                            if (ingestButtonEnabled) {
                                setIngestButtonEnabled(false);
                                beginIngest();
                            }
                        }}
                        variant="contained"
                        disabled={!ingestButtonEnabled}
                    >
                        Ingest
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

GenomicIngest.propTypes = {
    beginIngest: PropTypes.func.isRequired,
    fileUpload: PropTypes.element,
    clinicalData: PropTypes.object,
    genomicData: PropTypes.object
};

export default GenomicIngest;
