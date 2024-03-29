/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// mui
import { styled } from '@mui/material/styles';
import { Avatar, Chip, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';

// project imports
import { MENU_OPEN, SET_MENU } from 'store/actions';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const PREFIX = 'NavItem';

const classes = {
    listIcon: `${PREFIX}-listIcon`,
    listCustomIconSub: `${PREFIX}-listCustomIconSub`,
    listCustomIconSubActive: `${PREFIX}-listCustomIconSubActive`,
    listItem: `${PREFIX}-listItem`,
    listItemNoBack: `${PREFIX}-listItemNoBack`,
    subMenuCaption: `${PREFIX}-subMenuCaption`
};

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    [`& .${classes.listIcon}`]: {
        minWidth: '14px',
        marginTop: 'auto',
        marginBottom: 'auto'
    },

    [`& .${classes.listCustomIconSub}`]: {
        width: '4px',
        height: '4px'
    },

    [`& .${classes.listCustomIconSubActive}`]: {
        width: '4px',
        height: '4px'
    },

    [`& .${classes.listItem}`]: {
        alignItems: 'center'
    },

    [`& .${classes.listItemNoBack}`]: {
        backgroundColor: 'transparent !important',
        paddingTop: '4px',
        paddingBottom: '4px',
        alignItems: 'flex-start'
    },

    [`& .${classes.subMenuCaption}`]: {
        ...theme.typography.subMenuCaption
    }
}));

// ===========================|| SIDEBAR MENU LIST ITEMS ||=========================== //

const NavItem = ({ item, level }) => {
    const dispatch = useDispatch();
    const customization = useSelector((state) => state.customization);
    const matchesSM = useMediaQuery((theme) => theme.breakpoints.down('lg'));

    const Icon = item.icon;
    const itemIcon = item.icon ? (
        <Icon stroke={1} size="1.3rem" className={classes.listCustomIcon} />
    ) : (
        <FiberManualRecordIcon
            className={
                customization.isOpen.findIndex((id) => id === item.id) > -1 ? classes.listCustomIconSubActive : classes.listCustomIconSub
            }
            fontSize={level > 0 ? 'inherit' : 'default'}
        />
    );

    let itemIconClass = !item.icon ? classes.listIcon : classes.menuIcon;
    itemIconClass = customization.navType === 'nav-dark' ? [itemIconClass, classes.listCustomIcon].join(' ') : itemIconClass;

    let itemTarget = '';
    if (item.target) {
        itemTarget = '_blank';
    }

    let listItemProps = { component: React.forwardRef((props, ref) => <Link underline="hover" ref={ref} {...props} to={item.url} />) };
    if (item.external) {
        listItemProps = { component: 'a', href: item.url };
    }

    const itemHandler = (id) => {
        dispatch({ type: MENU_OPEN, id });
        if (matchesSM) dispatch({ type: SET_MENU, opened: false });
    };

    // active menu item on page load
    React.useEffect(() => {
        const currentIndex = document.location.pathname
            .toString()
            .split('/')
            .findIndex((id) => id === item.id);
        if (currentIndex > -1) {
            dispatch({ type: MENU_OPEN, id: item.id });
        }
        // eslint-disable-next-line
    }, []);

    return (
        <StyledListItemButton
            {...listItemProps}
            disabled={item.disabled}
            className={level > 1 ? classes.listItemNoBack : classes.listItem}
            sx={{ borderRadius: `${customization.borderRadius}px`, height: '34px' }}
            selected={customization.isOpen.findIndex((id) => id === item.id) > -1}
            onClick={() => itemHandler(item.id)}
            target={itemTarget}
        >
            <ListItemIcon className={itemIconClass}>{itemIcon}</ListItemIcon>
            <ListItemText
                primary={
                    <Typography variant={customization.isOpen.findIndex((id) => id === item.id) > -1 ? 'h6' : 'subtitle2'} color="inherit">
                        {item.title}
                    </Typography>
                }
                secondary={
                    item.caption && (
                        <Typography variant="caption" className={classes.subMenuCaption} display="block" gutterBottom>
                            {item.caption}
                        </Typography>
                    )
                }
            />
            {item.chip && (
                <Chip
                    color={item.chip.color}
                    variant={item.chip.variant}
                    size={item.chip.size}
                    label={item.chip.label}
                    avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
                />
            )}
        </StyledListItemButton>
    );
};

NavItem.propTypes = {
    item: PropTypes.object,
    level: PropTypes.number
};

export default NavItem;
