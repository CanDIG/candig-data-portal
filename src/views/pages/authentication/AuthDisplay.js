import { MutatingDots } from 'react-loader-spinner';

// mui
import { styled } from '@mui/material/styles';
import HourglassBottomTwoToneIcon from '@mui/icons-material/HourglassBottomTwoTone';
import { IconShieldLock } from '@tabler/icons-react';
import PropTypes from 'prop-types';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useAuthContext } from './AuthContext';
import { Button, Typography } from '@mui/material';
import config from 'config';

// assets
const PREFIX = 'AuthDisplay';

const classes = {
    mainCard: `${PREFIX}-maincard`,
    mainContainer: `${PREFIX}-maincontainer`,
    iconwrapper: `${PREFIX}-iconwrapper`,
    icon: `${PREFIX}-icon`,
    yellow: `${PREFIX}-yellow`,
    centered: `${PREFIX}-centered`,
    header: `${PREFIX}-header`,
    footer: `${PREFIX}-footer`,
    spacer: `${PREFIX}-spacer`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.mainContainer}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 88px)'
    },

    [`& .${classes.mainCard}`]: {
        width: '80%',
        boxShadow: theme.shadows[8]
    },

    [`& .${classes.iconwrapper}`]: {
        backgroundColor: '#EBEBEB',
        width: 'calc(100% + 24px)',
        marginLeft: -12,
        marginRight: -12,
        textAlign: 'center'
    },

    [`& .${classes.icon}`]: {
        width: 200,
        height: 200,
        color: '#7A0C0C'
    },

    [`& .${classes.yellow}`]: {
        width: 200,
        height: 200,
        color: '#F09934'
    },

    [`& .${classes.centered}`]: {
        textAlign: 'center'
    },

    [`& .${classes.spacer}`]: {
        height: 50
    },

    [`& .${classes.header}`]: {
        height: '8em'
    },

    [`& .${classes.footer}`]: {
        height: '8em'
    }
}));

function AlertCard(props) {
    const { icon, messageArea, button } = props;
    return (
        <div className={classes.centered}>
            <div className={classes.header} />
            <div className={classes.iconwrapper}>{icon}</div>
            <div className={classes.spacer} />
            {messageArea}
            <div className={classes.spacer} />
            {button}
            <div className={classes.footer} />
        </div>
    );
}

AlertCard.propTypes = {
    icon: PropTypes.node,
    messageArea: PropTypes.node,
    button: PropTypes.node
};

function AuthDisplay() {
    // Fire off the authorization check
    const authContext = useAuthContext();
    const authStatus = authContext[0];

    const requestAccess = () => {
        const authWriter = authContext[1];
        fetch('/ingest/user/pending/request', {
            method: 'POST'
        }).then(() => {
            // Then, force re-check of the status
            authWriter((old) => {
                const retVal = { ...old };
                retVal.reqNum += 1;
                return retVal;
            });
        });
    };

    let content;
    if (authStatus.loading) {
        content = <MutatingDots color="#2BAD60" secondaryColor="#037DB5" height="100" width="110" />;
    } else if (authStatus.pending) {
        content = (
            <AlertCard
                icon={<HourglassBottomTwoToneIcon className={`${classes.icon} ${classes.yellow}`} />}
                messageArea={
                    <>
                        <Typography variant="h2">
                            You are not authorized to access this site and your authorization request is still pending.
                        </Typography>
                        <Typography variant="h2">Please contact {config.supportEmail ?? 'your site admin'} for details</Typography>
                    </>
                }
                button={
                    config.supportEmail ? (
                        <Button variant="contained" href={`mailto: ${config.supportEmail}`}>
                            Contact
                        </Button>
                    ) : (
                        <>&nbsp;</>
                    )
                }
            />
        );
    } else {
        content = (
            <AlertCard
                icon={<IconShieldLock className={classes.icon} />}
                messageArea={
                    <Typography variant="h2">Sorry, you are not authorized to access this site. Please request access.</Typography>
                }
                button={
                    <Button variant="contained" onClick={requestAccess}>
                        Request access
                    </Button>
                }
            />
        );
    }

    return (
        <Root>
            <div className={classes.mainContainer}>
                <MainCard className={classes.mainCard}>{content}</MainCard>
            </div>
        </Root>
    );
}

export default AuthDisplay;
