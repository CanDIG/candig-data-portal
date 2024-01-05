import React from 'react';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';

import { useTheme } from '@mui/system';
import {
    Avatar,
    CardContent,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    List,
    ListItemIcon,
    ListItemText,
    Paper,
    Popper,
    Typography
} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import { SITE } from 'store/constant';

// assets
import { IconLogout, IconSettings } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';
import BCGSC from 'assets/images/users/bcgsc.svg';
import UHN from 'assets/images/users/UHN.svg';

const PREFIX = 'ProfileSection';

const classes = {
    navContainer: `${PREFIX}-navContainer`,
    headerAvatar: `${PREFIX}-headerAvatar`,
    profileChip: `${PREFIX}-profileChip`,
    profileLabel: `${PREFIX}-profileLabel`,
    listItem: `${PREFIX}-listItem`,
    cardContent: `${PREFIX}-cardContent`,
    showOnTop: `${PREFIX}-showOnTop`,
    card: `${PREFIX}-card`,
    searchControl: `${PREFIX}-searchControl`,
    startAdornment: `${PREFIX}-startAdornment`,
    flex: `${PREFIX}-flex`,
    name: `${PREFIX}-name`,
    ScrollHeight: `${PREFIX}-ScrollHeight`,
    badgeWarning: `${PREFIX}-badgeWarning`,
    usernamePadding: `${PREFIX}-usernamePadding`
};

const ChipRoot = styled(Chip)(({ theme }) => ({
    [`&.${classes.profileChip}`]: {
        height: '48px',
        alignItems: 'center',
        borderRadius: '27px',
        transition: 'all .2s ease-in-out',
        borderColor: theme.palette.primary.light,
        backgroundColor: theme.palette.primary.light,
        '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.main}!important`,
            color: theme.palette.primary.light,
            '& svg': {
                stroke: theme.palette.primary.light
            }
        }
    },

    [`&.${classes.profileLabel}`]: {
        lineHeight: 0,
        padding: '12px'
    },

    [`& .${classes.headerAvatar}`]: {
        cursor: 'pointer',
        ...theme.typography.mediumAvatar,
        margin: '8px 0 8px 8px !important'
    }
}));

const PopperRoot = styled(Popper)(({ theme }) => ({
    [`& .${classes.navContainer}`]: {
        width: '100%',
        maxWidth: '350px',
        minWidth: '300px',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        [theme.breakpoints.down('md')]: {
            minWidth: '100%'
        }
    },

    [`& .${classes.listItem}`]: {
        marginTop: '5px'
    },

    [`& .${classes.cardContent}`]: {
        padding: '16px !important'
    },

    [`&.${classes.showOnTop}`]: {
        zIndex: 11001
    },

    [`& .${classes.card}`]: {
        backgroundColor: theme.palette.primary.light,
        marginBottom: '16px',
        marginTop: '16px'
    },

    [`& .${classes.searchControl}`]: {
        width: '100%',
        paddingRight: '8px',
        paddingLeft: '16px',
        marginBottom: '16px',
        marginTop: '16px'
    },

    [`& .${classes.startAdornment}`]: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },

    [`& .${classes.flex}`]: {
        display: 'flex'
    },

    [`& .${classes.name}`]: {
        marginLeft: '2px',
        fontWeight: 400
    },

    [`& .${classes.ScrollHeight}`]: {
        height: '100%',
        maxHeight: 'calc(100vh - 250px)',
        overflowX: 'hidden'
    },

    [`& .${classes.badgeWarning}`]: {
        backgroundColor: theme.palette.warning.dark,
        color: '#fff'
    },

    [`& .${classes.usernamePadding}`]: {
        paddingBottom: '1em'
    }
}));

// ===========================|| PROFILE MENU ||=========================== //

function ProfileSection() {
    const theme = useTheme();
    const customization = useSelector((state) => state.customization);

    const [selectedIndex] = React.useState(1);

    const [open, setOpen] = React.useState(false);

    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };
    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);

    const setSite = () => {
        switch (SITE) {
            case 'BCGSC':
                return BCGSC;
            case 'UHN':
                return UHN;
            default:
                return User1;
        }
    };

    return (
        <>
            <ChipRoot
                classes={{ label: classes.profileLabel }}
                className={classes.profileChip}
                icon={
                    <Avatar
                        src={setSite()}
                        className={classes.headerAvatar}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        color="inherit"
                    />
                }
                label={<IconSettings stroke={1.5} size="1.5rem" color={theme.palette.primary.main} />}
                variant="outlined"
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                color="primary"
            />
            <PopperRoot
                placement="bottom-end"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                className={classes.showOnTop}
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 14]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <CardContent className={classes.cardContent}>
                                        <Grid container direction="column" spacing={0}>
                                            <Grid item className={classes.flex}>
                                                <Typography variant="h4">Hello!</Typography>
                                                {/* <Typography component="span" variant="h4" className={classes.name}>
                                                    First Name Last Name
                                                </Typography> */}
                                            </Grid>
                                            <Grid item className={classes.usernamePadding}>
                                                <Typography variant="subtitle2">{SITE}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                        <PerfectScrollbar className={classes.ScrollHeight}>
                                            <Divider />
                                            <List component="nav" className={classes.navContainer}>
                                                <ListItemButton
                                                    className={classes.listItem}
                                                    sx={{ borderRadius: `${customization.borderRadius}px` }}
                                                    selected={selectedIndex === 4}
                                                    to="/auth/logout"
                                                >
                                                    <ListItemIcon>
                                                        <IconLogout stroke={1.5} size="1.3rem" />
                                                    </ListItemIcon>
                                                    <ListItemText primary={<Typography variant="body2">Logout</Typography>} />
                                                </ListItemButton>
                                            </List>
                                        </PerfectScrollbar>
                                    </CardContent>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </PopperRoot>
        </>
    );
}

export default ProfileSection;
