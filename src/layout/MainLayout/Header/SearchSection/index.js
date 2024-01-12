import { useState } from 'react';

import { styled } from '@mui/material/styles';

// material-ui
import { Avatar, Box, ButtonBase, Card, CardContent, Grid, InputAdornment, OutlinedInput, Popper } from '@mui/material';

// third-party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

const PREFIX = 'SearchSection';

const classes = {
    searchControl: `${PREFIX}-searchControl`,
    startAdornment: `${PREFIX}-startAdornment`,
    headerAvatar: `${PREFIX}-headerAvatar`,
    closeAvatar: `${PREFIX}-closeAvatar`,
    popperContainer: `${PREFIX}-popperContainer`,
    cardContent: `${PREFIX}-cardContent`,
    card: `${PREFIX}-card`
};

const PopupBox = styled(Box)(({ theme }) => ({
    [`& .${classes.searchControl}`]: {
        width: '434px',
        marginLeft: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
        '& input': {
            background: 'transparent !important',
            paddingLeft: '5px !important'
        },
        [theme.breakpoints.down('xl')]: {
            width: '250px'
        },
        [theme.breakpoints.down('lg')]: {
            width: '100%',
            marginLeft: '4px',
            background: '#fff'
        }
    },

    [`& .${classes.startAdornment}`]: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },

    [`& .${classes.headerAvatar}`]: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.primary.light,
        color: theme.palette.primary.dark,
        '&:hover': {
            background: theme.palette.primary.dark,
            color: theme.palette.primary.light
        }
    },

    [`& .${classes.closeAvatar}`]: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.orange.light,
        color: theme.palette.orange.dark,
        '&:hover': {
            background: theme.palette.orange.dark,
            color: theme.palette.orange.light
        }
    },

    [`& .${classes.popperContainer}`]: {
        zIndex: 1100,
        width: '99%',
        top: '-55px !important',
        padding: '0 12px',
        [theme.breakpoints.down('md')]: {
            padding: '0 10px'
        }
    },

    [`& .${classes.cardContent}`]: {
        padding: '12px !important'
    },

    [`& .${classes.card}`]: {
        background: '#fff',
        [theme.breakpoints.down('md')]: {
            border: 0,
            boxShadow: 'none'
        }
    }
}));

const InputBox = styled(Box)(({ theme }) => ({
    [`& .${classes.searchControl}`]: {
        width: '434px',
        marginLeft: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
        '& input': {
            background: 'transparent !important',
            paddingLeft: '5px !important'
        },
        [theme.breakpoints.down('xl')]: {
            width: '250px'
        },
        [theme.breakpoints.down('lg')]: {
            width: '100%',
            marginLeft: '4px',
            background: '#fff'
        }
    },

    [`& .${classes.startAdornment}`]: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    }
}));

// ===========================|| SEARCH INPUT ||=========================== //

function SearchSection() {
    const [value, setValue] = useState('');

    return (
        <>
            <PopupBox sx={{ display: { xs: 'block', md: 'none' } }}>
                <PopupState variant="popper" popupId="demo-popup-popper">
                    {(popupState) => (
                        <>
                            <Box
                                sx={{
                                    ml: 2
                                }}
                            >
                                <ButtonBase sx={{ borderRadius: '12px' }}>
                                    <Avatar variant="rounded" className={classes.headerAvatar} {...bindToggle(popupState)}>
                                        <IconSearch stroke={1.5} size="1.2rem" />
                                    </Avatar>
                                </ButtonBase>
                            </Box>
                            <Popper {...bindPopper(popupState)} transition className={classes.popperContainer}>
                                {({ TransitionProps }) => (
                                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                        <Card className={classes.card}>
                                            <CardContent className={classes.cardContent}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs>
                                                        <OutlinedInput
                                                            className={classes.searchControl}
                                                            id="input-search-header"
                                                            value={value}
                                                            onChange={(e) => setValue(e.target.value)}
                                                            placeholder="Search"
                                                            startAdornment={
                                                                <InputAdornment position="start">
                                                                    <IconSearch
                                                                        stroke={1.5}
                                                                        size="1rem"
                                                                        className={classes.startAdornment}
                                                                    />
                                                                </InputAdornment>
                                                            }
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                        <Avatar variant="rounded" className={classes.headerAvatar}>
                                                                            <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                                                        </Avatar>
                                                                    </ButtonBase>
                                                                    <Box
                                                                        sx={{
                                                                            ml: 2
                                                                        }}
                                                                    >
                                                                        <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                            <Avatar
                                                                                variant="rounded"
                                                                                className={classes.closeAvatar}
                                                                                {...bindToggle(popupState)}
                                                                            >
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </Avatar>
                                                                        </ButtonBase>
                                                                    </Box>
                                                                </InputAdornment>
                                                            }
                                                            aria-describedby="search-helper-text"
                                                            inputProps={{
                                                                'aria-label': 'weight'
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Transitions>
                                )}
                            </Popper>
                        </>
                    )}
                </PopupState>
            </PopupBox>
            <InputBox sx={{ display: { xs: 'none', md: 'block' } }}>
                <OutlinedInput
                    className={classes.searchControl}
                    id="input-search-header"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search"
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                        </InputAdornment>
                    }
                    aria-describedby="search-helper-text"
                    inputProps={{
                        'aria-label': 'weight'
                    }}
                />
            </InputBox>
        </>
    );
}

export default SearchSection;
