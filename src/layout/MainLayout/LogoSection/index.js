import { Link } from 'react-router-dom';

// mui
import { ButtonBase } from '@mui/material';

// project imports
import config from 'config';
import Logo from 'ui-component/Logo';

// ===========================|| MAIN LOGO ||=========================== //

function LogoSection() {
    return (
        <ButtonBase disableRipple component={Link} to={config.defaultPath}>
            <Logo />
        </ButtonBase>
    );
}

export default LogoSection;
