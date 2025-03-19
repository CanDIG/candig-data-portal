// assets
import { IconClipboardText, IconLayoutDashboard } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

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
            icon: config.isDHDP ? IconClipboardText : IconLayoutDashboard,
            breadcrumbs: false
        }
    ]
};

export default summary;
