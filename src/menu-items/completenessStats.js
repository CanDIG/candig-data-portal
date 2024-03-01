// assets
import { IconTrendingUp } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconTrendingUp
};

// ===========================|| Completeness Stats MENU ITEMS ||=========================== //

const completenessStats = {
    id: 'completenessStats',
    title: 'Completeness Stats',
    type: 'group',
    children: [
        {
            id: 'Completeness Stats',
            title: 'Completeness Stats',
            type: 'item',
            url: `${basename}/completeness `,
            icon: icons.IconTrendingUp,
            breadcrumbs: false
        }
    ]
};

export default completenessStats;
