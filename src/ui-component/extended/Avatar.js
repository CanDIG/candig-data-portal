import PropTypes from 'prop-types';

// mui
import { styled } from '@mui/material/styles';
import MuiAvatar from '@mui/material/Avatar';

const PREFIX = 'Avatar';

const classes = {
    primaryBackground: `${PREFIX}-primaryBackground`,
    secondaryBackground: `${PREFIX}-secondaryBackground`,
    errorBackground: `${PREFIX}-errorBackground`,
    warningBackground: `${PREFIX}-warningBackground`,
    infoBackground: `${PREFIX}-infoBackground`,
    successBackground: `${PREFIX}-successBackground`,
    greyBackground: `${PREFIX}-greyBackground`,
    primaryOutline: `${PREFIX}-primaryOutline`,
    secondaryOutline: `${PREFIX}-secondaryOutline`,
    errorOutline: `${PREFIX}-errorOutline`,
    warningOutline: `${PREFIX}-warningOutline`,
    infoOutline: `${PREFIX}-infoOutline`,
    successOutline: `${PREFIX}-successOutline`,
    greyOutline: `${PREFIX}-greyOutline`,
    badge: `${PREFIX}-badge`,
    xs: `${PREFIX}-xs`,
    sm: `${PREFIX}-sm`,
    md: `${PREFIX}-md`,
    lg: `${PREFIX}-lg`,
    xl: `${PREFIX}-xl`
};

const StyledMuiAvatar = styled(MuiAvatar)(({ theme }) => ({
    [`& .${classes.primaryBackground}`]: {
        background: theme.palette.primary.main,
        color: theme.palette.background.paper
    },

    [`& .${classes.secondaryBackground}`]: {
        background: theme.palette.secondary.main,
        color: theme.palette.background.paper
    },

    [`& .${classes.errorBackground}`]: {
        background: theme.palette.error.main,
        color: theme.palette.background.paper
    },

    [`& .${classes.warningBackground}`]: {
        background: theme.palette.warning.dark,
        color: theme.palette.background.paper
    },

    [`& .${classes.infoBackground}`]: {
        background: theme.palette.info.main,
        color: theme.palette.background.paper
    },

    [`& .${classes.successBackground}`]: {
        background: theme.palette.success.dark,
        color: theme.palette.background.paper
    },

    [`& .${classes.greyBackground}`]: {
        background: theme.palette.grey[500],
        color: theme.palette.background.paper
    },

    [`& .${classes.primaryOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.primary.main,
        border: `2px solid ${theme.palette.primary.main}`
    },

    [`& .${classes.secondaryOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.secondary.main,
        border: `2px solid ${theme.palette.secondary.main}`
    },

    [`& .${classes.errorOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.error.main,
        border: `2px solid ${theme.palette.error.main}`
    },

    [`& .${classes.warningOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.warning.dark,
        border: `2px solid ${theme.palette.warning.dark}`
    },

    [`& .${classes.infoOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.info.main,
        border: `2px solid ${theme.palette.info.main}`
    },

    [`& .${classes.successOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.success.dark,
        border: `2px solid ${theme.palette.success.dark}`
    },

    [`& .${classes.greyOutline}`]: {
        background: theme.palette.background.paper,
        color: theme.palette.grey[500],
        border: `2px solid ${theme.palette.grey[500]}`
    },

    [`& .${classes.badge}`]: {
        width: theme.spacing(3.5),
        height: theme.spacing(3.5)
    },

    [`& .${classes.xs}`]: {
        width: theme.spacing(4.25),
        height: theme.spacing(4.25)
    },

    [`& .${classes.sm}`]: {
        width: theme.spacing(5),
        height: theme.spacing(5)
    },

    [`& .${classes.md}`]: {
        width: theme.spacing(7),
        height: theme.spacing(7)
    },

    [`& .${classes.lg}`]: {
        width: theme.spacing(9),
        height: theme.spacing(9)
    },

    [`& .${classes.xl}`]: {
        width: theme.spacing(10.25),
        height: theme.spacing(10.25)
    }
}));

// ===========================|| AVATAR ||=========================== //

function Avatar({ className, color, outline, size, ...others }) {
    let avatarClass = [];

    const outlineColor = outline ? [classes[`${color}Outline`], ...avatarClass] : [`${color}Background`, ...avatarClass];

    avatarClass = color ? outlineColor : avatarClass;
    avatarClass = size ? [classes[size], ...avatarClass] : avatarClass;
    if (className) {
        avatarClass = className ? [...avatarClass, className] : avatarClass;
    }

    return <StyledMuiAvatar className={avatarClass.join(' ')} {...others} />;
}

Avatar.propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    outline: PropTypes.bool,
    size: PropTypes.string
};

export default Avatar;
