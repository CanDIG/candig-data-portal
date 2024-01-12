// mui
import { styled } from '@mui/material/styles';
import { Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Skeleton } from '@mui/material';

const PREFIX = 'TotalIncomeCard';

const classes = {
    content: `${PREFIX}-content`,
    padding: `${PREFIX}-padding`
};

const StyledCard = styled(Card)({
    [`& .${classes.content}`]: {
        padding: '16px !important'
    },
    [`& .${classes.padding}`]: {
        paddingTop: 0,
        paddingBottom: 0
    }
});

// ===========================|| SKELETON - TOTAL INCOME DARK/LIGHT Card ||=========================== //

function TotalIncomeCard() {
    return (
        <StyledCard>
            <CardContent className={classes.content}>
                <List className={classes.padding}>
                    <ListItem alignItems="center" disableGutters className={classes.padding}>
                        <ListItemAvatar>
                            <Skeleton variant="rectangular" width={44} height={44} />
                        </ListItemAvatar>
                        <ListItemText
                            className={classes.padding}
                            primary={<Skeleton variant="rectangular" height={20} />}
                            secondary={<Skeleton variant="text" />}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </StyledCard>
    );
}

export default TotalIncomeCard;
