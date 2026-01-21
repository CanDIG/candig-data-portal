// assets
import { IconChartBar, IconTrendingUp } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

// ===========================|| Completeness Stats MENU ITEMS ||=========================== //

const completenessStats = {
    id: 'completenessStats',
    title: 'Completeness Stats',
    type: 'group',
    children: [
        {
            id: 'completeness',
            title: 'Completeness Stats',
            type: 'item',
            url: `${basename}/completeness `,
            icon: config.isDHDP ? IconChartBar : IconTrendingUp,
            breadcrumbs: false
        }
    ]
};

export default completenessStats;
