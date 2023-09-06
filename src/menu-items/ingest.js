// assets
import { IconUpload } from '@tabler/icons';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconUpload
};

// ===========================|| Ingest MENU ITEMS ||=========================== //

const ingest = {
    id: 'frontendIngest',
    title: 'Data Ingest',
    type: 'group',
    children: [
        {
            id: 'Data Ingest',
            title: 'Data Ingest',
            type: 'item',
            url: `${basename}/frontendIngest`,
            icon: icons.IconUpload,
            breadcrumbs: false
        }
    ]
};

export default ingest;
