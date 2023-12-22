import { Grid } from '@mui/material';
import { makeStyles } from '@mui/system';
import PropTypes from 'prop-types';

const IngestTabPage = ({ children }) => {
    const useStyles = makeStyles({
        ingestTabPage: {
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 100,
            borderBottomLeftRadius: '0.75em',
            borderBottomRightRadius: '0.75em',
            marginTop: 0,
            border: '0.125vw #2196F3 solid',
            borderTop: 'none',
            padding: '1em'
        }
    });

    const classes = useStyles();

    return <Grid className={classes.ingestTabPage}>{children}</Grid>;
};

IngestTabPage.propTypes = {
    children: PropTypes.node
};

export default IngestTabPage;
