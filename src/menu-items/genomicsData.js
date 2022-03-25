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
            id: 'file directory',
            title: 'file directory',
            type: 'item',
            url: '/file-directory',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'variants search',
            title: 'variants search',
            type: 'item',
            url: '/variants-search',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'reads search',
            title: 'reads search',
            type: 'item',
            url: '/reads-search',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'vcf browser',
            title: 'vcf browser',
            type: 'item',
            url: '/vcf-browser',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'bam browser',
            title: 'bam browser',
            type: 'item',
            url: '/bam-browser',
            icon: icons.IconFileSearch,
            breadcrumbs: false
        }
    ]
};

export default genomicsData;
