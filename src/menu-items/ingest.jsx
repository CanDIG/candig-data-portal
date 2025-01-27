// assets
import { IconUpload } from '@tabler/icons-react';

// import project config
import config from 'config';

// constant
const { basename } = config;

const icons = {
    IconUpload
};

// ===========================|| Ingest MENU ITEMS ||=========================== //

const ingest = {
    id: 'ingest',
    title: 'Data Ingest',
    type: 'group',
    children: [
        {
            id: 'Data Ingest',
            title: 'Data Ingest',
            type: 'item',
            url: `${basename}/data-ingest`,
            icon: icons.IconUpload,
            breadcrumbs: false
        }
    ]
};

export default ingest;
