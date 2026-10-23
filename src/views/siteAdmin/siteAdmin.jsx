import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// mui
import {
    IconLibraryPlus,
    IconListDetails,
    IconNetwork,
    IconShieldPlus,
    IconTopologyStarRing3,
    IconUserCheck,
    IconUserCog,
    IconUserExclamation,
    IconUserShield,
    IconUsersGroup
} from '@tabler/icons-react';

// project imports
import DashboardShell from '../../ui-component/DashboardShell';
import useSiteRoles from '../../hooks/useSiteRoles';
import PendingUsers from './PendingUsers';
import PreapprovedUsers from './PreapprovedUsers';
import DacAuthorizationsTable from './DacAuthorizationsTable';
import AddDacAuthorization from './AddDacAuthorization';
import RegisterProgram from './RegisterProgram';
import ManagePrograms from './ManagePrograms';
import SiteRoleManager from './SiteRoleManager';
import FederatedNodes from './FederatedNodes';
import AddFederatedServer from './AddFederatedServer';

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
    { id: 'admins', label: 'Site Admins', icon: IconUserShield },
    { id: 'nodes', label: 'Federated Nodes', icon: IconTopologyStarRing3 },
    { id: 'add-node', label: 'Add Federated Node', icon: IconNetwork }
];

function SiteAdmin() {
    const { loading, error, isSiteAdmin } = useSiteRoles();
    const [searchParams] = useSearchParams();
    // Allow deep-linking to a section, e.g. /siteAdmin?section=pending
    const requestedSection = SECTIONS.find((section) => section.id === searchParams.get('section'));
    const [activeSection, setActiveSection] = useState(requestedSection ? requestedSection.id : SECTIONS[0].id);

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
            case 'nodes':
                return <FederatedNodes onNavigate={setActiveSection} />;
            case 'add-node':
                return <AddFederatedServer onSuccess={() => setActiveSection('nodes')} />;
            default:
                return null;
        }
    };

    // Distinguish a failed authorization check from a genuine lack of access.
    const notice = error
        ? { severity: 'error', message: `Could not verify your access. ${error}` }
        : !isSiteAdmin
        ? { severity: 'error', message: 'You must be a site administrator to view this page.' }
        : null;

    return (
        <DashboardShell
            title="Site Admin Dashboard"
            loading={loading}
            notice={notice}
            sections={SECTIONS}
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            renderSection={renderSection}
        />
    );
}

export default SiteAdmin;
