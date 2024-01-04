// mui
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

const PREFIX = 'Loader';

const classes = {
    root: `${PREFIX}-root`
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1301,
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2)
        }
    }
}));

// ===========================|| Loader ||=========================== //

function Loader() {
    return (
        <Root className={classes.root}>
            <LinearProgress color="primary" />
        </Root>
    );
}

export default Loader;
