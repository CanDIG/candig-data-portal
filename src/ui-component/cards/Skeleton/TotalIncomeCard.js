import React from 'react';

// material-ui
import { makeStyles } from '@mui/styles';
import { Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Skeleton } from '@mui/material';

// style constant
const useStyles = makeStyles({
    content: {
        padding: '16px !important'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
});

// ===========================|| SKELETON - TOTAL INCOME DARK/LIGHT Card ||=========================== //

const TotalIncomeCard = () => {
    const classes = useStyles();
    return (
        <Card>
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
        </Card>
    );
};

export default TotalIncomeCard;
