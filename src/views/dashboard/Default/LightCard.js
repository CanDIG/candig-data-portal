import PropTypes from 'prop-types';
// mui
import { styled } from '@mui/material/styles';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

const PREFIX = 'LightCard';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    avatar: `${PREFIX}-avatar`,
    primary: `${PREFIX}-primary`,
    secondary: `${PREFIX}-secondary`,
    padding: `${PREFIX}-padding`
};

// ===========================|| DASHBOARD - TOTAL INCOME LIGHT CARD ||=========================== //

function LightCard({ isLoading, header, value, icon, color = 'grey' }) {
    // TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
    const Root = styled('div')(({ theme }) => ({
        [`& .${classes.card}`]: {
            backgroundColor: '#fff',
            color: theme.palette[color].light,
            overflow: 'hidden',
            position: 'relative',
            '&:after': {
                content: '""',
                position: 'absolute',
                width: '210px',
                height: '210px',
                background: `linear-gradient(210.04deg, ${theme.palette[color].dark} -50.94%, rgba(144, 202, 249, 0) 83.49%)`,
                borderRadius: '50%',
                top: '-30px',
                right: '-180px'
            },
            '&:before': {
                content: '""',
                position: 'absolute',
                width: '210px',
                height: '210px',
                background: `linear-gradient(140.9deg, ${theme.palette[color].dark} -14.02%, rgba(144, 202, 249, 0) 70.50%)`,
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
            backgroundColor: theme.palette[color].dark,
            color: '#fff'
        },

        [`& .${classes.primary}`]: {
            color: '#fff'
        },

        [`& .${classes.secondary}`]: {
            color: 'black',
            marginTop: '5px'
        },

        [`& .${classes.padding}`]: {
            paddingTop: 0,
            paddingBottom: 0
        }
    }));
    const events = useSelector((state) => state);

    return (
        <Root>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
                <MainCard
                    sx={{ borderRadius: events.customization.borderRadius * 0.25 }}
                    className={classes.card}
                    contentClass={classes.content}
                >
                    <List className={classes.padding}>
                        <ListItem alignItems="center" disableGutters className={classes.padding}>
                            <ListItemAvatar>
                                <Avatar variant="rounded" className={classes.avatar}>
                                    {icon}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                sx={{
                                    mt: 0.45,
                                    mb: 0.45
                                }}
                                className={classes.padding}
                                primary={<Typography variant="h4">{header}</Typography>}
                                secondary={
                                    <Typography variant="subtitle2" className={classes.secondary}>
                                        {value}
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

LightCard.propTypes = {
    isLoading: PropTypes.bool,
    header: PropTypes.string,
    value: PropTypes.any,
    icon: PropTypes.any,
    color: PropTypes.string
};

export default LightCard;
