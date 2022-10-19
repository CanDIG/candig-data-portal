import PropTypes from 'prop-types';

// mui
import { makeStyles } from '@mui/styles';

// project import
import MainCard from 'ui-component/cards/MainCard';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
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
    content: {
        padding: `${theme.spacing(5)} !important`,
        [theme.breakpoints.down('xl')]: {
            padding: `${theme.spacing(3)} !important`
        }
    }
}));

// ===========================|| AUTHENTICATION CARD WRAPPER ||=========================== //

const AuthCardWrapper = ({ children, ...other }) => {
    const classes = useStyles();

    return (
        <MainCard className={classes.card} contentClass={classes.content} {...other}>
            {children}
        </MainCard>
    );
};

AuthCardWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthCardWrapper;
