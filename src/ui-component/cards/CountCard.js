import { useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { makeStyles } from '@mui/system';
import { Avatar, Grid, Menu, MenuItem, Typography } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyOutlined';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: ({ primary }) => (primary ? theme.palette.primary.dark : theme.palette.secondary.dark),
        color: '#fff    ',
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: ({ primary }) => (primary ? theme.palette.primary[800] : theme.palette.secondary[800]),
            borderRadius: '50%',
            top: '-85px',
            right: '-95px',
            [theme.breakpoints.down('sm')]: {
                top: '-105px',
                right: '-140px'
            }
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: ({ primary }) => (primary ? theme.palette.primary[800] : theme.palette.secondary[800]),
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.down('sm')]: {
                top: '-155px',
                right: '-70px'
            }
        }
    },
    content: {
        padding: '20px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: ({ primary }) => (primary ? theme.palette.primary[800] : theme.palette.secondary[800]),
        color: ({ primary }) => (primary ? theme.palette.primary[200] : theme.palette.secondary[200]),
        marginTop: '8px'
    },
    avatarRight: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        backgroundColor: ({ primary }) => (primary ? theme.palette.primary.dark : theme.palette.secondary.dark),
        color: ({ primary }) => (primary ? theme.palette.primary[200] : theme.palette.secondary[200]),
        zIndex: 1
    },
    cardHeading: {
        fontSize: '2.125rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },
    subHeading: {
        fontSize: '1rem',
        fontWeight: 500,
        color: ({ primary }) => (primary ? theme.palette.primary[200] : theme.palette.secondary[200])
    },
    avatarCircle: {
        cursor: 'pointer',
        ...theme.typography.smallAvatar,
        backgroundColor: ({ primary }) => (primary ? theme.palette.primary[200] : theme.palette.secondary[200]),
        color: ({ primary }) => (primary ? theme.palette.primary.dark : theme.palette.secondary.dark)
    },
    circleIcon: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    },
    menuItem: {
        marginRight: '14px',
        fontSize: '1.25rem'
    }
}));

//= ==========================|| INDIVIDUAL OVERVIEW - COUNT CARD ||===========================//

const CountCard = ({ isLoading, title, count, primary, icon }) => {
    const classes = useStyles({ primary });
    const events = useSelector((state) => state);

    // STATES
    const [anchorEl, setAnchorEl] = useState(null);

    // const handleClick = (event) => {
    //     setAnchorEl(event.currentTarget);
    // };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {isLoading ? (
                <SkeletonEarningCard />
            ) : (
                <MainCard
                    sx={{
                        borderRadius: events.customization.borderRadius * 0.25
                    }}
                    border={false}
                    className={classes.card}
                    contentClass={classes.content}
                >
                    <Grid container direction="column">
                        <Grid item>
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Avatar variant="rounded" className={classes.avatar}>
                                        {icon}
                                    </Avatar>
                                </Grid>
                                <Grid item>
                                    <Menu
                                        id="menu-earning-card"
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                        variant="selectedMenu"
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right'
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right'
                                        }}
                                    >
                                        <MenuItem onClick={handleClose}>
                                            <GetAppTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Import Card
                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <FileCopyTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Copy Data
                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <PictureAsPdfTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Export
                                        </MenuItem>
                                        <MenuItem onClick={handleClose}>
                                            <ArchiveTwoToneIcon fontSize="inherit" className={classes.menuItem} /> Archive File
                                        </MenuItem>
                                    </Menu>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems="center">
                                <Grid item>
                                    <Typography className={classes.cardHeading}>{count}</Typography>
                                </Grid>
                                <Grid item>
                                    <Avatar className={classes.avatarCircle}>
                                        <ArrowUpwardIcon fontSize="inherit" className={classes.circleIcon} />
                                    </Avatar>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ mb: 1.25 }}>
                            <Typography className={classes.subHeading}>{title}</Typography>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </>
    );
};

CountCard.propTypes = {
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    count: PropTypes.number,
    primary: PropTypes.bool,
    icon: PropTypes.any
};

export default CountCard;
