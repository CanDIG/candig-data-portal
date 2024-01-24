import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

// material
import { AppBar, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';
import { styled } from '@mui/material/styles';

// third-party
import clsx from 'clsx';

// project imports
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import navigation from 'menu-items';
import { drawerWidth } from 'store/constant';
import { SET_MENU } from 'store/actions';
import { SidebarProvider } from './Sidebar/SidebarContext';

// assets
import { IconChevronRight } from '@tabler/icons-react';

// style constant
const PREFIX = 'MainLayout';
const classes = {
    root: `${PREFIX}-root`,
    rootShift: `${PREFIX}-rootShift`,
    appBar: `${PREFIX}-appBar`,
    appBarWidth: `${PREFIX}-appBarWidth`,
    content: `${PREFIX}-content`,
    contentShift: `${PREFIX}-contentShift`,
    footer: `${PREFIX}-footer`,
    footerWidth: `${PREFIX}-footerWidth`
};
const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
        flexDirection: 'column'
    },
    [`&.${classes.rootShift}`]: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`
    },
    [`& .${classes.appBar}`]: {
        backgroundColor: theme.palette.background.default
    },
    [`& .${classes.appBarWidth}`]: {
        transition: theme.transitions.create('width'),
        backgroundColor: theme.palette.background.default,
        height: 100
    },
    [`& .${classes.content}`]: {
        ...theme.typography.mainContent,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: `3px dashed ${theme.palette.primary.main}`,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        // marginLeft: -(drawerWidth - 20),
        // width: `calc(100% - ${drawerWidth}px)`,
        [theme.breakpoints.down('lg')]: {
            padding: '16px'
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: '10px',
            padding: '16px',
            marginRight: '10px'
        }
    },
    [`& .${classes.contentShift}`]: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        }),
        marginLeft: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        [theme.breakpoints.down('lg')]: {
            marginLeft: '20px'
            // marginLeft: -(drawerWidth - 20)
        },
        [theme.breakpoints.down('md')]: {
            marginLeft: '20px'
            // marginLeft: -(drawerWidth - 10)
        }
    },
    [`& .${classes.footer}`]: {
        backgroundColor: theme.palette.background.default,
        marginLeft: drawerWidth - 20,
        width: `calc(100% - ${drawerWidth}px)`
    },
    [`& .${classes.footerWidth}`]: {
        transition: theme.transitions.create('width'),
        marginLeft: drawerWidth - 20,
        width: `calc(100% - ${drawerWidth}px)`
    }
}));

// ===========================|| MAIN LAYOUT ||=========================== //

function MainLayout() {
    const theme = useTheme();
    const matchDownMd = useMediaQuery(theme.breakpoints.down('lg'));

    // Handle left drawer
    const [sidebarContent, setSidebarContent] = useState(null);
    const leftDrawerOpened = useSelector((state) => state.customization.opened) && !!sidebarContent;
    const dispatch = useDispatch();
    const handleLeftDrawerToggle = () => {
        dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
    };

    useEffect(() => {
        dispatch({ type: SET_MENU, opened: !matchDownMd });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchDownMd]);

    return (
        <Root
            className={clsx([
                classes.root,
                {
                    [classes.rootShift]: leftDrawerOpened
                }
            ])}
        >
            <SidebarProvider data={sidebarContent} setData={setSidebarContent}>
                <CssBaseline />
                {/* header */}
                <AppBar
                    enableColorOnDark
                    position="fixed"
                    color="inherit"
                    elevation={0}
                    className={leftDrawerOpened ? classes.appBarWidth : classes.appBar}
                >
                    <Toolbar>
                        <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
                    </Toolbar>
                </AppBar>

                {/* drawer */}
                <Sidebar drawerOpen={leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

                {/* main content */}
                <main
                    className={clsx([
                        classes.content,
                        {
                            [classes.contentShift]: leftDrawerOpened
                        }
                    ])}
                >
                    {/* breadcrumb */}
                    <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
                    <Outlet />
                </main>

                {/* FOOTER */}
                <Footer className={leftDrawerOpened ? classes.footerWidth : classes.footer} />
            </SidebarProvider>
        </Root>
    );
}

export default MainLayout;
