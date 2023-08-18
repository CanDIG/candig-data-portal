import { Button, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { makeField, DataRow } from 'ui-component/DataRow';
import { makeStyles } from '@mui/styles';

const GenomicIngest = ({ beginIngest, fileUpload }) => {
    const cohort = [makeField('Cohort', 'MOCK COHORT'), makeField('Clinical Patients', '850'), makeField('Read Access', '3')];

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
        }
    });
    const classes = useStyles();

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
                    <Button className={classes.ingestButton} onClick={beginIngest} variant="contained">
                        Ingest
                    </Button>
                </Grid>
            </Grid>
        </>
    );
};

GenomicIngest.propTypes = {
    beginIngest: PropTypes.func.isRequired,
    fileUpload: PropTypes.element
};

export default GenomicIngest;
