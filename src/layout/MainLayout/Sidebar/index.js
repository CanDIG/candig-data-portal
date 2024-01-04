import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';

// mui
import { useTheme } from '@mui/system';
import { Box, Drawer, useMediaQuery } from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import LogoSection from '../LogoSection';
import { drawerWidth } from 'store/constant';
import { useSidebarReaderContext } from './SidebarContext';

const PREFIX = 'Sidebar';

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

function Sidebar({ drawerOpen, drawerToggle, window }) {
    const theme = useTheme();
    const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
    const sidebarContext = useSidebarReaderContext();

    const drawer = (
        <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <div className={classes.boxContainer}>
                    <LogoSection />
                </div>
            </Box>
            <BrowserView>
                <PerfectScrollbar component="div" className={classes.ScrollHeight}>
                    {sidebarContext || null}
                </PerfectScrollbar>
            </BrowserView>
            <MobileView>
                <Box sx={{ px: 2 }}>{sidebarContext || null}</Box>
            </MobileView>
        </>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Root className={classes.drawer} aria-label="mailbox folders">
            <Drawer
                container={container}
                variant={matchUpMd ? 'persistent' : 'temporary'}
                anchor="left"
                open={drawerOpen}
                onClose={drawerToggle}
                classes={{
                    paper: classes.drawerPaper
                }}
                ModalProps={{ keepMounted: true }}
                color="inherit"
            >
                {drawer}
            </Drawer>
        </Root>
    );
}

Sidebar.propTypes = {
    drawerOpen: PropTypes.bool,
    drawerToggle: PropTypes.func,
    window: PropTypes.object
};

export default Sidebar;
