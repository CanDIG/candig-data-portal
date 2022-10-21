// assets
import { IconReportMedical } from '@tabler/icons';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconReportMedical
};

// ===========================|| Clinical MENU ITEMS ||=========================== //

const overview = {
    id: 'overview',
    title: 'Overview',
    type: 'group',
    children: [
        {
            id: 'summary',
            title: 'Summary',
            type: 'item',
            url: `${basename}/individuals-overview`,
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default overview;
