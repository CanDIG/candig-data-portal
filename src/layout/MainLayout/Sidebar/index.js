import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';

// mui
import { Box, Drawer } from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import LogoSection from '../LogoSection';
import { drawerWidth } from 'store/constant';
import { useSidebarReaderContext } from './SidebarContext';

const PREFIX = 'MainLayoutSidebar';

const classes = {
    drawer: `${PREFIX}-drawer`,
    drawerPaper: `${PREFIX}-drawerPaper`,
    ScrollHeight: `${PREFIX}-ScrollHeight`,
    boxContainer: `${PREFIX}-boxContainer`
};

const Root = styled('nav')(({ theme }) => ({
    [`&.${classes.drawer}`]: {
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },

    [`& .${classes.drawerPaper}`]: {
        width: drawerWidth,
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderRight: 'none',
        [theme.breakpoints.up('md')]: {
            top: '88px'
        }
    },

    [`& .${classes.ScrollHeight}`]: {
        height: 'calc(100vh - 88px)',
        [theme.breakpoints.down('md')]: {
            height: 'calc(100vh - 56px)'
        }
    },

    [`& .${classes.boxContainer}`]: {
        display: 'flex',
        padding: '16px',
        marginLeft: 'auto',
        marginRight: 'auto'
    }
}));

// ===========================|| SIDEBAR DRAWER ||=========================== //
function Sidebar({ useFullScreen, drawerOpen, drawerToggle }) {
    const sidebarContext = useSidebarReaderContext();
    const [lastUsedFullscreen, setLastUsedFullscreen] = useState(useFullScreen);

    useEffect(() => {
        setLastUsedFullscreen(useFullScreen);
    }, [useFullScreen]);

    // NB: There's an issue where changing Drawer's `variant` and `open` too quickly (i.e. in a double-redraw update via useEffect)
    //      causes a bug where the modal presentation is open (blocking user input) but nothing is displayed
    //      To fix this, we're going to manually force the menu closed when we detect useFullScreen changes
    const useOpen = useFullScreen !== lastUsedFullscreen ? false : drawerOpen;

    return (
        <Root className={classes.drawer} aria-label="mailbox folders">
            <Drawer
                variant={useFullScreen ? 'persistent' : 'temporary'}
                anchor="left"
                open={useOpen}
                onClose={drawerToggle}
                classes={{
                    paper: classes.drawerPaper
                }}
                color="inherit"
            >
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <div className={classes.boxContainer}>
                        <LogoSection />
                    </div>
                </Box>
                <BrowserView>
                    <PerfectScrollbar component="div" className={classes.ScrollHeight}>
                        {
                            // The fragment below suppresses a warning we get in console due to undefined passed as a child
                            // eslint-disable-next-line react/jsx-no-useless-fragment
                            sidebarContext || <></>
                        }
                    </PerfectScrollbar>
                </BrowserView>
                <MobileView>
                    <Box sx={{ px: 2 }}>{sidebarContext || null}</Box>
                </MobileView>
            </Drawer>
        </Root>
    );
}

Sidebar.propTypes = {
    drawerOpen: PropTypes.bool,
    drawerToggle: PropTypes.func,
    useFullScreen: PropTypes.bool
};

export default Sidebar;
