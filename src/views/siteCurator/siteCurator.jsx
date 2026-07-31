import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// mui
import { IconLibraryPlus, IconListDetails, IconShieldPlus, IconUserCog } from '@tabler/icons-react';

// project imports
import DashboardShell from '../../ui-component/DashboardShell';
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
    const { loading, error, isSiteCurator } = useSiteRoles();
    const [searchParams] = useSearchParams();
    const requestedSection = SECTIONS.find((section) => section.id === searchParams.get('section'));
    const [activeSection, setActiveSection] = useState(requestedSection ? requestedSection.id : SECTIONS[0].id);

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

    const notice = error
        ? { severity: 'error', message: `Could not verify your access. ${error}` }
        : !isSiteCurator
        ? { severity: 'error', message: 'You must be a site curator to view this page.' }
        : null;

    return (
        <DashboardShell
            title="Site Curator Dashboard"
            loading={loading}
            notice={notice}
            sections={SECTIONS}
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            renderSection={renderSection}
        />
    );
}

export default SiteCurator;
