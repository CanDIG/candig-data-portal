// mui
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';

const PREFIX = 'MaterialIcons';

const classes = {
    frame: `${PREFIX}-frame`
};

const StyledMainCard = styled(MainCard)(({ theme }) => ({
    [`& .${classes.frame}`]: {
        height: 'calc(100vh - 210px)',
        border: '1px solid',
        borderColor: theme.palette.primary.light
    }
}));

//= ===========================|| MATERIAL ICONS ||============================//

function MaterialIcons() {
    return (
        <StyledMainCard title="Material Icons" secondary={<SecondaryAction link="https://material-ui.com/components/material-icons/" />}>
            <Card sx={{ overflow: 'hidden' }}>
                <iframe
                    title="Material Icon"
                    className={classes.frame}
                    width="100%"
                    src="https://material-ui.com/components/material-icons/"
                />
            </Card>
        </StyledMainCard>
    );
}

export default MaterialIcons;
