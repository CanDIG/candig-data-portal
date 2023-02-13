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

const clinicalGenomicSearch = {
    id: 'clinicalGenomicSearch',
    title: 'clinical & Genomic Search',
    type: 'group',
    children: [
        {
            id: 'Clinical & Genomic Search',
            title: 'Clinical & Genomic Search',
            type: 'item',
            url: `${basename}/clinicalGenomicSearch `,
            icon: icons.IconReportMedical,
            breadcrumbs: false
        }
    ]
};

export default clinicalGenomicSearch;
