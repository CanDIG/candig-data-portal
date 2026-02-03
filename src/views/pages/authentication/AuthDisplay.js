import { useState } from 'react';
import { MutatingDots } from 'react-loader-spinner';

// MUI Imports
import { styled } from '@mui/material/styles';
import { Button, Typography } from '@mui/material';
import HourglassBottomTwoToneIcon from '@mui/icons-material/HourglassBottomTwoTone';

// Project Imports
import MainCard from 'ui-component/cards/MainCard';
import RequestAccessForm from 'ui-component/RequestAccessForm';
import { useAuthContext } from './AuthContext';
import config from 'config';

// Assets
import CanDIGLogo from 'assets/images/icons/canDIGLogo.png';
import DHDPLogo from 'assets/images/dhdp-full-horizontal.svg';
import PropTypes from 'prop-types';

const PREFIX = 'AuthDisplay';

const classes = {
    root: `${PREFIX}-root`,
    mainCard: `${PREFIX}-mainCard`,
    iconWrapper: `${PREFIX}-iconWrapper`,
    spacer: `${PREFIX}-spacer`,
    header: `${PREFIX}-header`,
    footer: `${PREFIX}-footer`,
    icon: `${PREFIX}-icon`,
    logo: `${PREFIX}-logo`,
    welcomeText: `${PREFIX}-welcomeText`,
    boldText: `${PREFIX}-boldText`,
    primaryText: `${PREFIX}-primaryText`,
    secondaryText: `${PREFIX}-secondaryText`
};

const StyledDiv = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 88px)'
    },
    [`& .${classes.mainCard}`]: {
        width: '80%',
        boxShadow: theme.shadows[8]
    },
    [`& .${classes.iconWrapper}`]: {
        backgroundColor: '#EBEBEB',
        width: 'calc(100% + 24px)',
        marginLeft: -12,
        marginRight: -12,
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
    },
    [`& .${classes.icon}`]: {
        width: 200,
        height: 200,
        color: '#F09934'
    },
    [`& .${classes.logo}`]: {
        height: 150,
        marginTop: '2em',
        marginBottom: '2em'
    },
    [`& .${classes.welcomeText}`]: {
        fontFamily: 'Catamaran, sans-serif',
        fontWeight: 'light',
        fontSize: '3rem',
        textAlign: 'center',
        marginBottom: '3rem'
    },
    [`& .${classes.boldText}`]: {
        fontWeight: 'bold'
    },
    [`& .${classes.primaryText}`]: {
        color: theme.palette.primary.main
    },
    [`& .${classes.secondaryText}`]: {
        color: theme.palette.secondary.main
    }
}));

function AlertCard({ header, icon, messageArea, button }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div className={classes.header} />
            {header}
            <div className={classes.iconWrapper}>{icon}</div>
            <div className={classes.spacer} />
            {messageArea}
            <div className={classes.spacer} />
            {button}
            <div className={classes.footer} />
        </div>
    );
}

AlertCard.propTypes = {
    header: PropTypes.node,
    icon: PropTypes.node,
    messageArea: PropTypes.node,
    button: PropTypes.node
};

function AuthDisplay() {
    const [requestAccessFormOpen, setRequestAccessFormOpen] = useState(false);
    const [requestAccessFormData, setRequestAccessFormData] = useState({});

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

    const openRequestAccessForm = () => {
        setRequestAccessFormOpen(true);
    };

    let content;
    if (authStatus.loading) {
        content = <MutatingDots color="#2BAD60" secondaryColor="#037DB5" height="100" width="110" />;
    } else if (authStatus.pending) {
        content = (
            <AlertCard
                icon={<HourglassBottomTwoToneIcon className={classes.icon} />}
                messageArea={
                    <>
                        <Typography variant="h2" sx={{ fontWeight: 'light' }}>
                            Your access request is still pending.
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 'light' }}>
                            Please contact your support team {config.supportEmail ?? 'or your site admin'} for details
                        </Typography>
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
                header={
                    <Typography variant="h1" className={classes.welcomeText}>
                        Welcome to&nbsp;
                        {config.isDHDP ? (
                            <span className={classes.boldText}>the DHDP discovery portal</span>
                        ) : (
                            <>
                                <span className={classes.boldText}>
                                    <span className={classes.primaryText}> Can</span>
                                    <span className={classes.secondaryText}>DIG</span>
                                </span>
                                <span>!</span>
                            </>
                        )}
                    </Typography>
                }
                icon={
                    <img
                        src={config.isDHDP ? DHDPLogo : CanDIGLogo}
                        alt={`${config.isDHDP ? 'DHDP' : 'CanDIG'} Logo`}
                        className={classes.logo}
                    />
                }
                messageArea={
                    <Typography variant="h2" sx={{ fontWeight: 'light' }}>
                        To access the service, please press the request access button below.
                    </Typography>
                }
                button={
                    <>
                        <Button variant="contained" onClick={openRequestAccessForm}>
                            Request access
                        </Button>
                        <RequestAccessForm
                            open={requestAccessFormOpen}
                            setOpen={setRequestAccessFormOpen}
                            data={requestAccessFormData}
                            setData={setRequestAccessFormData}
                            onSubmit={requestAccess}
                        />
                    </>
                }
            />
        );
    }

    return (
        <StyledDiv className={classes.root}>
            <MainCard className={classes.mainCard}>{content}</MainCard>
        </StyledDiv>
    );
}

export default AuthDisplay;
