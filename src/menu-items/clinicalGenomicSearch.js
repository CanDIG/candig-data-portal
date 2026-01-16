// assets
import { IconSearch, IconReportSearch } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

// ===========================|| Clinical MENU ITEMS ||=========================== //

const clinicalGenomicSearch = {
    id: 'clinicalGenomicSearch',
    title: 'clinical Search',
    type: 'group',
    children: [
        {
            id: 'clinicalGenomicSearch',
            title: 'Clinical Search',
            type: 'item',
            url: `${basename}/clinicalGenomicSearch `,
            icon: config.isDHDP ? IconSearch : IconReportSearch,
            breadcrumbs: false
        }
    ]
};

export default clinicalGenomicSearch;
