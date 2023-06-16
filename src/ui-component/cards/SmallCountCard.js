import PropTypes from 'prop-types';

// mui
import { makeStyles } from '@mui/styles';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: 'white',
        color: ({ color }) => (color ? theme.palette.primary.light : null),
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: ({ color }) =>
                color
                    ? `linear-gradient(210.04deg, ${color} -50.94%, rgba(144, 202, 249, 0) 83.49%)`
                    : `linear-gradient(210.04deg, ${theme.palette.grey[700]} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
            borderRadius: '50%',
            // top: '160px',
            top: '-30px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: ({ color }) =>
                color
                    ? `linear-gradient(140.9deg, ${color} -14.02%, rgba(144, 202, 249, 0) 77.58%)`
                    : `linear-gradient(140.9deg, ${theme.palette.grey[700]} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
            borderRadius: '50%',
            top: '-160px',
            right: '-130px'
        }
    },
    content: {
        padding: '16px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: ({ color }) => (color ? 'white' : theme.palette.grey[300]),
        color: ({ color }) => color || theme.palette.grey[700],
        border: ({ color }) => (color ? '1px solid' : null)
    },
    primary: {
        color: ({ color }) => (color ? 'black' : '#fff')
    },
    secondary: {
        color: ({ color }) => (color ? theme.palette.grey[500] : 'white'),
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

// ===========================|| INDIVIDUALS - SMALL COUNT CARD ||=========================== //

const SmallCountCard = ({ isLoading, title, count, icon, color }) => {
    const events = useSelector((state) => state);
    const classes = useStyles({ color });

    return (
        <>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <MainCard
                    border
                    sx={{ borderRadius: events.customization.borderRadius * 0.25 }}
                    className={classes.card}
                    contentClass={classes.content}
                >
                    <List className={classes.padding}>
                        <ListItem alignItems="center" disableGutters className={classes.padding}>
                            {icon && (
                                <ListItemAvatar>
                                    <Avatar variant="rounded" className={classes.avatar}>
                                        {icon}
                                    </Avatar>
                                </ListItemAvatar>
                            )}
                            <ListItemText
                                className={classes.padding}
                                sx={{
                                    mt: 0.45,
                                    mb: 0.45
                                }}
                                primary={
                                    <Typography variant="h4" className={classes.primary}>
                                        {count}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="subtitle2" className={classes.secondary}>
                                        {title}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </MainCard>
            )}
        </>
    );
};

SmallCountCard.propTypes = {
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    count: PropTypes.any,
    icon: PropTypes.any,
    color: PropTypes.string
};

export default SmallCountCard;
