import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// mui
import {
    Alert,
    Box,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery
} from '@mui/material';
import { IconLibraryPlus, IconListDetails, IconShieldPlus, IconUserCog } from '@tabler/icons-react';

// project imports
import MainCard from '../../ui-component/cards/MainCard';
import DefaultErrorBoundary from '../../ui-component/DefaultErrorBoundary';
import useSiteRoles from '../../hooks/useSiteRoles';
import DacAuthorizationsTable from '../siteAdmin/DacAuthorizationsTable';
import AddDacAuthorization from '../siteAdmin/AddDacAuthorization';
import RegisterProgram from '../siteAdmin/RegisterProgram';
import ManagePrograms from '../siteAdmin/ManagePrograms';

// ===========================|| SITE CURATOR DASHBOARD ||=========================== //

// A site curator can curate any program: view/add DAC authorizations and
// register programs. User approval (pending/preapproved) is site-admin only and
// is intentionally excluded.
const SECTIONS = [
    { id: 'dac', label: 'DAC Authorizations', icon: IconListDetails },
    { id: 'add-dac', label: 'Add DAC Authorization', icon: IconShieldPlus },
    { id: 'register', label: 'Register Program', icon: IconLibraryPlus },
    { id: 'program', label: 'Manage Programs', icon: IconUserCog }
];

function SiteCurator() {
    const { loading, isSiteCurator } = useSiteRoles();
    const [searchParams] = useSearchParams();
    const requestedSection = SECTIONS.find((section) => section.id === searchParams.get('section'));
    const [activeSection, setActiveSection] = useState(requestedSection ? requestedSection.id : SECTIONS[0].id);
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down('md'));

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isSiteCurator) {
        return (
            <MainCard title="Site Curator Dashboard">
                <Alert severity="error">You must be a site curator to view this page.</Alert>
            </MainCard>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'dac':
                return <DacAuthorizationsTable onNavigate={setActiveSection} />;
            case 'add-dac':
                return <AddDacAuthorization onSuccess={() => setActiveSection('dac')} />;
            case 'register':
                return <RegisterProgram onNavigate={setActiveSection} />;
            case 'program':
                return <ManagePrograms onNavigate={setActiveSection} />;
            default:
                return null;
        }
    };

    return (
        <MainCard title="Site Curator Dashboard">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
                    <List component="nav" sx={{ p: 0 }}>
                        {SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <ListItemButton
                                    key={section.id}
                                    selected={activeSection === section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    sx={{ borderRadius: 2, mb: 0.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <SectionIcon size="1.3rem" stroke={1.5} />
                                    </ListItemIcon>
                                    <ListItemText primary={section.label} />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>
                {isSmall ? <Divider /> : <Divider orientation="vertical" flexItem />}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <DefaultErrorBoundary>{renderSection()}</DefaultErrorBoundary>
                </Box>
            </Box>
        </MainCard>
    );
}

export default SiteCurator;
