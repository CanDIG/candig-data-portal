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

const summary = {
    id: 'summary',
    title: 'Summary',
    type: 'group',
    children: [
        {
            id: 'summary',
            title: 'Summary',
            type: 'item',
            url: `${basename}/summary`,
            icon: icons.IconLayoutDashboard,
            breadcrumbs: false
        }
    ]
};

export default summary;
