import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

// mui
import { ButtonBase } from '@mui/material';

// project imports
import config from 'config';
import Logo from 'ui-component/Logo';
import { MENU_OPEN } from 'store/actions';

// ===========================|| MAIN LOGO ||=========================== //

function LogoSection() {
    const dispatch = useDispatch();

    return (
        <ButtonBase disableRipple component={Link} to={config.defaultPath} onClick={() => dispatch({ type: MENU_OPEN, id: 'summary' })}>
            <Logo />
        </ButtonBase>
    );
}

export default LogoSection;
