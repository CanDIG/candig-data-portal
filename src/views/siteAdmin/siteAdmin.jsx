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
import {
    IconLibraryPlus,
    IconListDetails,
    IconShieldPlus,
    IconUserCheck,
    IconUserCog,
    IconUserExclamation,
    IconUserShield,
    IconUsersGroup
} from '@tabler/icons-react';

// project imports
import MainCard from '../../ui-component/cards/MainCard';
import DefaultErrorBoundary from '../../ui-component/DefaultErrorBoundary';
import useSiteAdmin from '../../hooks/useSiteAdmin';
import PendingUsers from './PendingUsers';
import PreapprovedUsers from './PreapprovedUsers';
import DacAuthorizationsTable from './DacAuthorizationsTable';
import AddDacAuthorization from './AddDacAuthorization';
import RegisterProgram from './RegisterProgram';
import ManagePrograms from './ManagePrograms';
import SiteRoleManager from './SiteRoleManager';

// ===========================|| SITE ADMIN DASHBOARD ||=========================== //

// Section ids used both for the sidebar and for cross-section navigation.
const SECTIONS = [
    { id: 'pending', label: 'Pending Users', icon: IconUserExclamation },
    { id: 'preapproved', label: 'Preapproved Users', icon: IconUserCheck },
    { id: 'dac', label: 'DAC Authorizations', icon: IconListDetails },
    { id: 'add-dac', label: 'Add DAC Authorization', icon: IconShieldPlus },
    { id: 'register', label: 'Register Program', icon: IconLibraryPlus },
    { id: 'program', label: 'Manage Programs', icon: IconUserCog },
    { id: 'curators', label: 'Site Curators', icon: IconUsersGroup },
    { id: 'admins', label: 'Site Admins', icon: IconUserShield }
];

function SiteAdmin() {
    const { loading, isSiteAdmin } = useSiteAdmin();
    const [searchParams] = useSearchParams();
    // Allow deep-linking to a section, e.g. /siteAdmin?section=pending
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

    if (!isSiteAdmin) {
        return (
            <MainCard title="Site Admin Dashboard">
                <Alert severity="error">You must be a site administrator to view this page.</Alert>
            </MainCard>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'pending':
                return <PendingUsers />;
            case 'preapproved':
                return <PreapprovedUsers />;
            case 'dac':
                return <DacAuthorizationsTable onNavigate={setActiveSection} />;
            case 'add-dac':
                return <AddDacAuthorization onSuccess={() => setActiveSection('dac')} />;
            case 'register':
                return <RegisterProgram onNavigate={setActiveSection} />;
            case 'program':
                return <ManagePrograms onNavigate={setActiveSection} />;
            case 'curators':
                return (
                    <SiteRoleManager
                        roleType="curator"
                        title="Site Curators"
                        description="Site curators can curate and manage data for any program on this node."
                        addLabel="site curator(s)"
                        columnHeader="Curator"
                        emptyLabel="No site curators"
                    />
                );
            case 'admins':
                return (
                    <SiteRoleManager
                        roleType="admin"
                        title="Site Admins"
                        description="Site admins have full access to this node, including approving users and managing all programs. The last remaining site admin cannot be removed."
                        addLabel="site admin(s)"
                        columnHeader="Admin"
                        emptyLabel="No site admins"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <MainCard title="Site Admin Dashboard">
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

export default SiteAdmin;
