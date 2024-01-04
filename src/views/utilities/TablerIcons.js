// mui
import { styled } from '@mui/system';
import { Card } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';

// style constant
const PREFIX = 'MainLayoutHeader';
const classes = {
    grow: `${PREFIX}-grow`,
    headerAvatar: `${PREFIX}-headerAvatar`,
    boxContainer: `${PREFIX}-boxContainer`
};
const Root = styled('flex')(({ theme }) => ({
const useStyles = makeStyles((theme) => ({
    frame: {
        height: 'calc(100vh - 210px)',
        border: '1px solid',
        borderColor: theme.palette.primary.light
    }
}));

//= ============================|| TABLER ICONS ||=============================//

const TablerIcons = () => {
    const classes = useStyles();

    return (
        <MainCard title="Tabler Icons" secondary={<SecondaryAction link="https://tablericons.com/" />}>
            <Card sx={{ overflow: 'hidden' }}>
                <iframe title="Tabler Icons" className={classes.frame} width="100%" src="https://tablericons.com/" />
            </Card>
        </MainCard>
    );
};

export default TablerIcons;
