import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';

// mui
import { Grid, Box } from '@mui/material';

const PREFIX = 'Tabs';

const classes = {
    tabs: `${PREFIX}-tabs`,
    active: `${PREFIX}-active`
};

const StyledBox = styled(Box)({
    [`& .${classes.tabs}`]: {
        background: 'white',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '0.85em',
        color: 'grey',
        borderBottom: '3px solid white',
        '&:hover': {
            borderBottom: '3px solid #2196f3',
            color: '#2196f3'
        }
    },
    [`& .${classes.active}`]: {
        background: 'white',
        fontWeight: 'bold',
        fontSize: '0.85em',
        border: 'none',
        borderBottom: '3px solid #2196f3',
        color: '#2196f3'
    }
});

function Tabs({ tabHeaders, setActiveTab, activeTab }) {
    return (
        <StyledBox mb={3}>
            <Grid container direction="row">
                {tabHeaders.map((header) => (
                    <Box
                        component="button"
                        pl={1}
                        pr={1}
                        pt={2}
                        pb={2}
                        className={activeTab === header ? classes.active : classes.tabs}
                        onClick={() => setActiveTab(header)}
                        key={header}
                    >
                        {header}
                    </Box>
                ))}
            </Grid>
        </StyledBox>
    );
}

Tabs.propTypes = {
    tabHeaders: PropTypes.array,
    setActiveTab: PropTypes.func,
    activeTab: PropTypes.string
};

export default Tabs;
