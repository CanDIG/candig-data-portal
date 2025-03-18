// assets
import { IconLayoutDashboard } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconLayoutDashboard
};

// ===========================|| Clinical MENU ITEMS ||=========================== //

const authCheck = {
    id: 'authCheck',
    title: 'Authorization Check',
    type: 'group',
    children: [
        {
            id: 'authCheck',
            title: 'Authorization Check',
            type: 'item',
            url: `${basename}/auth`,
            icon: icons.IconLayoutDashboard,
            breadcrumbs: false
        }
    ]
};

export default authCheck;
