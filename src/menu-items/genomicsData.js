// assets
import { IconFileSearch, IconBrowser, IconFolder } from '@tabler/icons';

// import prepend route
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconFileSearch,
    IconBrowser,
    IconFolder
};

// ===========================|| Genomics Data MENU ITEMS ||=========================== //

const genomicsData = {
    id: 'genomicsData',
    title: 'Genomics Data',
    type: 'group',
    children: [
        {
            id: 'variants search',
            title: 'Variants Search',
            type: 'item',
            url: `${basename}/variants-search`,
            icon: icons.IconFileSearch,
            breadcrumbs: false
        }
    ]
};

export default genomicsData;
