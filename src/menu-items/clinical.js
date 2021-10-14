// assets
import { IconReportMedical } from '@tabler/icons';

// constant
const icons = {
    IconReportMedical
};

// ===========================|| Clinical MENU ITEMS ||=========================== //

const clinical = {
    id: 'clinical',
    title: 'clinical data',
    type: 'group',
    children: [
        {
            id: 'mcode',
            title: 'mcode',
            type: 'item',
            url: '/mcode',
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default clinical;
