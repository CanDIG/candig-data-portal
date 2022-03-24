// assets
import { IconFileSearch } from '@tabler/icons';

// constant
const icons = {
    IconFileSearch
};

// ===========================|| Genomics Data MENU ITEMS ||=========================== //

const genomicsData = {
    id: 'genomicsData',
    title: 'Genomics Data',
    type: 'group',
    children: [
        {
            id: 'variants search',
            title: 'variants search',
            type: 'item',
            url: '/variantssearch',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        }
    ]
};

export default genomicsData;
