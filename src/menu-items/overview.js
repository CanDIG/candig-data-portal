// assets
import { IconReportMedical } from '@tabler/icons';

// constant
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
            id: 'individual',
            title: 'individuals',
            type: 'item',
            url: '/individuals-overview',
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default overview;
