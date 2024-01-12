import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const PREFIX = 'IngestTabPage';

const classes = {
    ingestTabPage: `${PREFIX}-ingestTabPage`
};

const StyledGrid = styled(Grid)({
    [`&.${classes.ingestTabPage}`]: {
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

function IngestTabPage({ children }) {
    return <StyledGrid className={classes.ingestTabPage}>{children}</StyledGrid>;
}

IngestTabPage.propTypes = {
    children: PropTypes.node
};

export default IngestTabPage;
