import { useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// mui
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

const PREFIX = 'CountCard';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    avatar: `${PREFIX}-avatar`,
    avatarRight: `${PREFIX}-avatarRight`,
    cardHeading: `${PREFIX}-cardHeading`,
    subHeading: `${PREFIX}-subHeading`,
    avatarCircle: `${PREFIX}-avatarCircle`,
    circleIcon: `${PREFIX}-circleIcon`,
    menuItem: `${PREFIX}-menuItem`
};

//= ==========================|| INDIVIDUAL OVERVIEW - COUNT CARD ||===========================//

function CountCard({ isLoading, title, count, primary, icon }) {
    const events = useSelector((state) => state);

    // TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
    const Root = styled('div')(({ theme }) => ({
        [`& .${classes.card}`]: {
            backgroundColor: primary ? theme.palette.primary.dark : theme.palette.secondary.dark,
            color: '#fff    ',
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
                content: '""',
                position: 'absolute',
                width: '210px',
                height: '210px',
                background: primary ? theme.palette.primary[800] : theme.palette.secondary[800],
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
                background: primary ? theme.palette.primary[800] : theme.palette.secondary[800],
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

        [`& .${classes.content}`]: {
            padding: '20px !important'
        },

        [`& .${classes.avatar}`]: {
            ...theme.typography.commonAvatar,
            ...theme.typography.largeAvatar,
            backgroundColor: primary ? theme.palette.primary[800] : theme.palette.secondary[800],
            color: primary ? theme.palette.primary[200] : theme.palette.secondary[200],
            marginTop: '8px'
        },

        [`& .${classes.avatarRight}`]: {
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            backgroundColor: primary ? theme.palette.primary.dark : theme.palette.secondary.dark,
            color: primary ? theme.palette.primary[200] : theme.palette.secondary[200],
            zIndex: 1
        },

        [`& .${classes.cardHeading}`]: {
            fontSize: '2.125rem',
            fontWeight: 500,
            marginRight: '8px',
            marginTop: '14px',
            marginBottom: '6px'
        },

        [`& .${classes.subHeading}`]: {
            fontSize: '1rem',
            fontWeight: 500,
            color: primary ? theme.palette.primary[200] : theme.palette.secondary[200]
        },

        [`& .${classes.avatarCircle}`]: {
            cursor: 'pointer',
            ...theme.typography.smallAvatar,
            backgroundColor: primary ? theme.palette.primary[200] : theme.palette.secondary[200],
            color: primary ? theme.palette.primary.dark : theme.palette.secondary.dark
        },

        [`& .${classes.circleIcon}`]: {
            transform: 'rotate3d(1, 1, 1, 45deg)'
        },

        [`& .${classes.menuItem}`]: {
            marginRight: '14px',
            fontSize: '1.25rem'
        }
    }));

    // STATES
    const [anchorEl, setAnchorEl] = useState(null);

    // const handleClick = (event) => {
    //     setAnchorEl(event.currentTarget);
    // };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Root>
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
        </Root>
    );
}

CountCard.propTypes = {
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    count: PropTypes.number,
    primary: PropTypes.bool,
    icon: PropTypes.any
};

export default CountCard;
