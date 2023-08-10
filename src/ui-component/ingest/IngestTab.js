import { styled } from '@mui/styles';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import ClinicalIngestPage from 'ui-component/ingest/ClinicalIngest';

const tabs = ['Permissions', 'Clinical Ingest', 'Genomic Ingest'];

const IngestTab = styled(Tab)({
    height: '2.75em',
    paddingLeft: '0.77em',
    paddingRight: '0.77em',
    marginBottom: 0,
    borderTopLeftRadius: '0.55em',
    borderTopRightRadius: '0.55em',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'start',
    gap: '0.59em',
    display: 'flex',
    textAlign: 'left',
    color: '#686969',
    fontSize: '1.5em',
    fontFamily: 'Roboto',
    fontWeight: '700',
    wordWrap: 'break-word',
    textTransform: 'none',
    verticalAlign: 'center'
});

export default function IngestMenu() {
    const [value, setValue] = useState(0);
    const setTab = (event, val) => {
        setValue(val);
    };

    function getPage(val) {
        if (val === 1) return <ClinicalIngestPage />;
        if (val === 2) return <ClinicalIngestPage />;
        if (val === 3) return <ClinicalIngestPage />;
        return <ClinicalIngestPage />;
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs
                value={value}
                onChange={setTab}
                variant="fullWidth"
                sx={{ width: '100%' }}
                TabIndicatorProps={{
                    style: { display: 'none' }
                }}
                centered
            >
                {tabs.map((name, idx) => (
                    <IngestTab
                        label={name}
                        key={name}
                        sx={{
                            border: idx === value ? '0.15vw #2196F3 solid' : '0.1vw #2196F3 solid',
                            borderBottom: idx === value ? 'none' : '0.15vw #2196F3 solid',
                            background: idx === value ? '#FFFFFF' : '#F4FAFF'
                        }}
                    />
                ))}
            </Tabs>
            {getPage(value)}
        </Box>
    );
}
