import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Avatar, Box, ButtonBase } from '@mui/material';

// project imports
import LogoSection from '../LogoSection';
// import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
// import NotificationSection from './NotificationSection';
import MenuList from '../../../MenuList';

// assets
import { IconMenu2 } from '@tabler/icons-react';
import { useSidebarReaderContext } from '../Sidebar/SidebarContext';

// style constant
const PREFIX = 'MainLayoutHeader';
const classes = {
    grow: `${PREFIX}-grow`,
    headerAvatar: `${PREFIX}-headerAvatar`,
    boxContainer: `${PREFIX}-boxContainer`
};
const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.headerAvatar}`]: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.primary.light,
        color: theme.palette.primary.dark,
        '&:hover': {
            background: theme.palette.primary.dark,
            color: theme.palette.primary.light
        }
    },
    [`& .${classes.boxContainer}`]: {
        width: '228px',
        display: 'flex',
        [theme.breakpoints.down('lg')]: {
            width: 'auto'
        }
    }
}));
const StyledGrow = styled('div')(({ _ }) => ({
    [`&.${classes.grow}`]: {
        flexGrow: 1
    }
}));

// ===========================|| MAIN NAVBAR / HEADER ||=========================== //

function Header({ handleLeftDrawerToggle }) {
    const sidebar = useSidebarReaderContext();

    return (
        <>
            {/* logo & toggler button */}
            <StyledBox sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div className={classes.boxContainer}>
                    <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
                        <LogoSection />
                    </Box>
                    {sidebar && (
                        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                            <Avatar variant="rounded" className={classes.headerAvatar} onClick={handleLeftDrawerToggle} color="inherit">
                                <IconMenu2 stroke={1.5} size="1.3rem" />
                            </Avatar>
                        </ButtonBase>
                    )}
                </div>
                <Box pl={2} sx={{ display: 'flex', flexDirection: 'row' }}>
                    <MenuList />
                </Box>
            </StyledBox>
            {/* header search */}
            {/* <SearchSection theme="light" />  Currently not needed */}
            <StyledGrow className={classes.grow} />
            <StyledGrow className={classes.grow} />

            {/* notification & profile */}
            {/* <NotificationSection /> */}
            <ProfileSection />
        </>
    );
}

Header.propTypes = {
    handleLeftDrawerToggle: PropTypes.func
};

export default Header;
