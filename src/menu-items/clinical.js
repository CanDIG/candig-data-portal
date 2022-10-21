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

const clinical = {
    id: 'clinical',
    title: 'clinical data',
    type: 'group',
    children: [
        {
            id: 'Clinical Search',
            title: 'Clinical Search',
            type: 'item',
            url: `${basename}/mcode`,
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default clinical;
