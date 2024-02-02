// mui
import { styled } from '@mui/material/styles';
import { Card, CardContent, Grid, Skeleton } from '@mui/material';

// project imports
import { gridSpacing } from 'store/constant';

const PREFIX = 'PopularCard';

const classes = {
    cardAction: `${PREFIX}-cardAction`
};

const StyledCard = styled(Card)({
    [`& .${classes.cardAction}`]: {
        padding: '10px',
        display: 'flex',
        paddingTop: 0,
        justifyContent: 'center'
    }
});

// ===========================|| SKELETON - POPULAR CARD ||=========================== //

function PopularCard() {
    return (
        <StyledCard>
            <CardContent>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <Grid container alignItems="center" justifyContent="space-between" spacing={gridSpacing}>
                            <Grid item xs zeroMinWidth>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                            <Grid item>
                                <Skeleton variant="rectangular" height={20} width={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Skeleton variant="rectangular" height={150} />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Skeleton variant="rectangular" height={20} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Skeleton variant="rectangular" height={20} />
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="rectangular" height={16} width={16} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Skeleton variant="rectangular" height={20} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Skeleton variant="rectangular" height={20} />
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="rectangular" height={16} width={16} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Skeleton variant="rectangular" height={20} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Skeleton variant="rectangular" height={20} />
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="rectangular" height={16} width={16} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Skeleton variant="rectangular" height={20} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Skeleton variant="rectangular" height={20} />
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="rectangular" height={16} width={16} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={1}>
                            <Grid item xs={12}>
                                <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Skeleton variant="rectangular" height={20} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Grid container alignItems="center" spacing={gridSpacing} justifyContent="space-between">
                                            <Grid item xs zeroMinWidth>
                                                <Skeleton variant="rectangular" height={20} />
                                            </Grid>
                                            <Grid item>
                                                <Skeleton variant="rectangular" height={16} width={16} />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={6}>
                                <Skeleton variant="rectangular" height={20} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
            <CardContent className={classes.cardAction}>
                <Skeleton variant="rectangular" height={25} width={75} />
            </CardContent>
        </StyledCard>
    );
}

export default PopularCard;
