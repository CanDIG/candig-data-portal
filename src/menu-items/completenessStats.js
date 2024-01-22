// assets
import { IconReportMedical } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconReportMedical
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
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default completenessStats;
