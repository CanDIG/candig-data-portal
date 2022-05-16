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
            id: 'file directory',
            title: 'file directory',
            type: 'item',
            url: `${basename}/file-directory`,
            icon: icons.IconFolder,
            breadcrumbs: false
        },
        {
            id: 'variants search',
            title: 'variants search',
            type: 'item',
            url: `${basename}/variants-search`,
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'vcf browser',
            title: 'vcf browser',
            type: 'item',
            url: `${basename}/vcf-browser`,
            icon: icons.IconBrowser,
            breadcrumbs: false
        },
        {
            id: 'reads search',
            title: 'reads search',
            type: 'item',
            url: `${basename}/reads-search`,
            icon: icons.IconFileSearch,
            breadcrumbs: false
        },
        {
            id: 'bam browser',
            title: 'bam browser',
            type: 'item',
            url: `${basename}/bam-browser`,
            icon: icons.IconBrowser,
            breadcrumbs: false
        },
        {
            id: 'htsget browser',
            title: 'htsget browser',
            type: 'item',
            url: `${basename}/htsget-browser`,
            icon: icons.IconBrowser,
            breadcrumbs: false
        }
    ]
};

export default genomicsData;
