// mui
import { styled } from '@mui/material/styles';
import { Card, CardContent, Grid, Skeleton } from '@mui/material';

const PREFIX = 'EarningCard';

const classes = {
    cardHeading: `${PREFIX}-cardHeading`
};

const StyledCard = styled(Card)({
    [`& .${classes.cardHeading}`]: {
        marginRight: '8px',
        marginTop: '18px',
        marginBottom: '14px'
    }
});

// ===========================|| SKELETON EARNING CARD ||=========================== //

function EarningCard() {
    return (
        <StyledCard>
            <CardContent>
                <Grid container direction="column">
                    <Grid item>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Skeleton variant="rectangular" width={44} height={44} />
                            </Grid>
                            <Grid item>
                                <Skeleton variant="rectangular" width={34} height={34} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Skeleton variant="rectangular" className={classes.cardHeading} height={40} />
                    </Grid>
                    <Grid item>
                        <Skeleton variant="rectangular" height={30} />
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
}

export default EarningCard;
