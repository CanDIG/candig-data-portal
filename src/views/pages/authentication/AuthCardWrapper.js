import PropTypes from 'prop-types';

// mui
import { styled } from '@mui/material/styles';

// project import
import MainCard from 'ui-component/cards/MainCard';

const PREFIX = 'AuthCardWrapper';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`
};

const StyledMainCard = styled(MainCard)(({ theme }) => ({
    [`&.${classes.card}`]: {
        maxWidth: '475px',
        '& > *': {
            flexGrow: 1,
            flexBasis: '50%'
        },
        [theme.breakpoints.down('md')]: {
            margin: '20px'
        },
        [theme.breakpoints.down('xl')]: {
            maxWidth: '400px'
        }
    },

    [`& .${classes.content}`]: {
        padding: `${theme.spacing(5)} !important`,
        [theme.breakpoints.down('xl')]: {
            padding: `${theme.spacing(3)} !important`
        }
    }
}));

// ===========================|| AUTHENTICATION CARD WRAPPER ||=========================== //

function AuthCardWrapper({ children, ...other }) {
    return (
        <StyledMainCard className={classes.card} contentClass={classes.content} {...other}>
            {children}
        </StyledMainCard>
    );
}

AuthCardWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthCardWrapper;
