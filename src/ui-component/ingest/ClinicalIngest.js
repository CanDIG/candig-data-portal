import { Button, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { makeField, DataRow } from 'ui-component/DataRow';
import { makeStyles } from '@mui/styles';

const ClinicalIngest = ({ setTab, fileUpload }) => {
    // setTab should be a function that sets the tab to the genomic ingest page
    const dataRowFields = [
        [makeField('Cohort', 'MOCK COHORT'), makeField('Clinical Patients', '850'), makeField('Read Access', '3')],
        [makeField('Cohort', 'MOCK COHORT 2'), makeField('Clinical Patients', '325'), makeField('Read Access', '1')],
        [makeField('Cohort', 'MOCK COHORT 2'), makeField('Clinical Patients', '78'), makeField('Read Access', '2')]
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
        }
    });
    const classes = useStyles();

    return (
        <>
            <Grid container direction="column" spacing={4}>
                <Grid item>
                    <Typography align="left" className={classes.titleText}>
                        <b>Active cohorts</b>
                    </Typography>
                    <Grid direction="row" spacing={3} container>
                        {dataRowFields.map((fields, index) => (
                            <Grid item xs={5} key={index}>
                                <DataRow rowWidth="100%" itemSize="0.9em" fields={fields} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={2} md={2} sm={2}>
                    <div>
                        <Typography align="left" className={classes.titleText}>
                            <b>Choose a cohort for validation</b>
                        </Typography>
                        <Grid container sx={{ marginTop: '0.5em', marginLeft: '1em' }} direction="row" alignItems="center" spacing={2}>
                            <Grid item>
                                <Typography align="left" className={classes.bodyText}>
                                    <b>Clinical data:</b>
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                {fileUpload}
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
                <Grid item>
                    <Typography align="left" className={classes.titleText}>
                        <b>Live Preview Summary</b>
                    </Typography>
                    <Typography sx={{ color: 'grey' }} align="left" className={classes.bodyText}>
                        Waiting for upload...
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography align="left" className={classes.titleText}>
                        <b>Validation</b>
                    </Typography>
                    <Typography sx={{ color: 'grey' }} align="left" className={classes.bodyText}>
                        Waiting for upload...
                    </Typography>
                </Grid>
            </Grid>
            <Button sx={{ position: 'absolute', right: '0.2em', bottom: '0.2em' }} onClick={setTab} variant="contained">
                Next
            </Button>
        </>
    );
};

ClinicalIngest.propTypes = {
    setTab: PropTypes.func.isRequired,
    fileUpload: PropTypes.element
};

export default ClinicalIngest;
