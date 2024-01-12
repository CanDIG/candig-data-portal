import PropTypes from 'prop-types';

import { styled } from '@mui/material/styles';

// mui
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

const PREFIX = 'SmallCountCard';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    avatar: `${PREFIX}-avatar`,
    primary: `${PREFIX}-primary`,
    secondary: `${PREFIX}-secondary`,
    padding: `${PREFIX}-padding`
};

// ===========================|| INDIVIDUALS - SMALL COUNT CARD ||=========================== //

function SmallCountCard({ isLoading, title, count, icon, color }) {
    const events = useSelector((state) => state);

    // TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
    const Root = styled('div')(({ theme }) => ({
        [`& .${classes.card}`]: {
            backgroundColor: 'white',
            color: color ? theme.palette.primary.light : null,
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

        [`& .${classes.content}`]: {
            padding: '16px !important'
        },

        [`& .${classes.avatar}`]: {
            ...theme.typography.commonAvatar,
            ...theme.typography.largeAvatar,
            backgroundColor: color ? 'white' : theme.palette.grey[300],
            color: color || theme.palette.grey[700],
            border: color ? '1px solid' : null
        },

        [`& .${classes.primary}`]: {
            color: color ? 'black' : '#fff'
        },

        [`& .${classes.secondary}`]: {
            color: color ? theme.palette.grey[500] : 'white',
            marginTop: '5px'
        },

        [`& .${classes.padding}`]: {
            paddingTop: 0,
            paddingBottom: 0
        }
    }));

    return (
        <Root>
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
        </Root>
    );
}

SmallCountCard.propTypes = {
    isLoading: PropTypes.bool,
    title: PropTypes.string,
    count: PropTypes.any,
    icon: PropTypes.any,
    color: PropTypes.string
};

export default SmallCountCard;
