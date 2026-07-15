import { useEffect, useState } from 'react';

// mui
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
    useMediaQuery
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconId, IconShieldCheck, IconUserCog, IconUsers } from '@tabler/icons-react';

// project imports
import MainCard from '../../ui-component/cards/MainCard';
import DefaultErrorBoundary from '../../ui-component/DefaultErrorBoundary';
import ManagePrograms from '../siteAdmin/ManagePrograms';
import { fetchCurrentUserAuthorization } from '../../store/api';

// Friendly labels for the global site roles.
const SITE_ROLE_LABELS = { admin: 'Site Admin', curator: 'Site Curator' };

// Classify a DAC authorization by its date window relative to today.
function dacStatus(dac) {
    const today = new Date().toISOString().slice(0, 10);
    if (dac.start_date && today < dac.start_date) {
        return 'Upcoming';
    }
    if (dac.end_date && today > dac.end_date) {
        return 'Expired';
    }
    return 'Active';
}

const STATUS_COLORS = { Active: 'success', Upcoming: 'info', Expired: 'default' };

// ===========================|| USER DASHBOARD ||=========================== //

/*
 * A generic, read-only view of the current user's own authorizations: the
 * programs they curate / are a team member of, and the DAC authorizations they
 * hold. Program curators additionally get a "Manage Programs" section to add
 * team members / curators to the programs they curate. Sourced from the ingest
 * service's /user/me endpoint.
 */
function UserDashboard() {
    const [state, setState] = useState({ loading: true, error: null, data: null });
    const [activeSection, setActiveSection] = useState('access');
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down('md'));

    useEffect(() => {
        let active = true;
        fetchCurrentUserAuthorization()
            .then((data) => active && setState({ loading: false, error: null, data }))
            .catch((error) => active && setState({ loading: false, error: `${error}`, data: null }));
        return () => {
            active = false;
        };
    }, []);

    if (state.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (state.error) {
        return (
            <MainCard title="User Dashboard">
                <Alert severity="error">Could not load your authorizations. {state.error}</Alert>
            </MainCard>
        );
    }

    const data = state.data || {};
    const userName = data.userinfo?.user_name || 'Unknown user';
    const siteRoles = data.site_roles || [];

    // This dashboard is for standard users; site admins / curators have their own.
    if (siteRoles.includes('admin') || siteRoles.includes('curator')) {
        return (
            <MainCard title="User Dashboard">
                <Alert severity="info">
                    This dashboard is for standard users. Use your Site Admin or Site Curator Dashboard to view and manage authorizations.
                </Alert>
            </MainCard>
        );
    }

    const programAuth = data.program_authorizations || {};
    const curatorPrograms = programAuth.program_curator || [];
    const teamPrograms = programAuth.team_member || [];
    // dac_authorizations is an object keyed by program id (empty array when none).
    const dacObject = Array.isArray(programAuth.dac_authorizations) ? {} : programAuth.dac_authorizations || {};
    const dacRows = Object.entries(dacObject).map(([programId, dac], index) => ({
        id: index,
        program_id: dac.program_id || programId,
        dac_id: dac.dac_id || '',
        start_date: dac.start_date || '',
        end_date: dac.end_date || '',
        status: dacStatus(dac)
    }));

    // Combine program-curator and team-member programs into one access table,
    // aggregating both levels onto a single row per program.
    const accessMap = {};
    curatorPrograms.forEach((program) => {
        (accessMap[program] = accessMap[program] || new Set()).add('Program Curator');
    });
    teamPrograms.forEach((program) => {
        (accessMap[program] = accessMap[program] || new Set()).add('Team Member');
    });
    const accessRows = Object.entries(accessMap).map(([program, levels], index) => {
        const levelList = [...levels];
        return { id: index, program_id: program, levels: levelList, access_level: levelList.join(', ') };
    });

    const accessColumns = [
        { field: 'program_id', headerName: 'Program', flex: 1, minWidth: 200 },
        {
            field: 'access_level',
            headerName: 'Access Level',
            flex: 1,
            minWidth: 240,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    {params.row.levels.map((level) => (
                        <Chip key={level} label={level} size="small" color={level === 'Program Curator' ? 'primary' : 'default'} />
                    ))}
                </Stack>
            )
        }
    ];

    const dacColumns = [
        { field: 'program_id', headerName: 'Program', flex: 1, minWidth: 160 },
        { field: 'dac_id', headerName: 'DAC ID', flex: 1, minWidth: 130 },
        { field: 'start_date', headerName: 'Start Date', flex: 1, minWidth: 120 },
        { field: 'end_date', headerName: 'End Date', flex: 1, minWidth: 120 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => <Chip label={params.value} size="small" color={STATUS_COLORS[params.value] || 'default'} />
        }
    ];

    const isProgramCurator = curatorPrograms.length > 0;
    const sections = [{ id: 'access', label: 'My Authorizations', icon: IconId }];
    if (isProgramCurator) {
        sections.push({ id: 'manage', label: 'Manage Programs', icon: IconUserCog });
    }
    // Guard against a stale selection if the user isn't a curator.
    const currentSection = sections.some((section) => section.id === activeSection) ? activeSection : 'access';

    const renderSection = () => {
        if (currentSection === 'manage') {
            return (
                <>
                    <Typography variant="h4" mb={1}>
                        Manage Your Programs
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mb={2}>
                        As a program curator you can add team members and program curators to the programs you curate.
                    </Typography>
                    <ManagePrograms allowedPrograms={curatorPrograms} showHeading={false} />
                </>
            );
        }
        return (
            <>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <IconUsers size="1.2rem" stroke={1.5} />
                    <Typography variant="h5">Program Access</Typography>
                    <Chip label={accessRows.length} size="small" />
                </Stack>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Programs you can access as a program curator or team member.
                </Typography>
                <Box sx={{ height: 340, width: '100%' }}>
                    <DataGrid
                        rows={accessRows}
                        columns={accessColumns}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{ toolbar: { showQuickFilter: true } }}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        localeText={{ noRowsLabel: 'You are not a curator or team member of any program' }}
                        disableRowSelectionOnClick
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <IconShieldCheck size="1.2rem" stroke={1.5} />
                    <Typography variant="h5">DAC Authorizations</Typography>
                    <Chip label={dacRows.length} size="small" />
                </Stack>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Time-bounded program access granted to you by a Data Access Committee.
                </Typography>
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={dacRows}
                        columns={dacColumns}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{ toolbar: { showQuickFilter: true } }}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        localeText={{ noRowsLabel: 'You have no DAC authorizations' }}
                        disableRowSelectionOnClick
                    />
                </Box>
            </>
        );
    };

    return (
        <MainCard title="User Dashboard">
            <DefaultErrorBoundary>
                <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                    <Typography variant="h4">{userName}</Typography>
                    {siteRoles
                        .filter((role) => SITE_ROLE_LABELS[role])
                        .map((role) => (
                            <Chip key={role} label={SITE_ROLE_LABELS[role]} color="primary" size="small" />
                        ))}
                </Stack>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
                        <List component="nav" sx={{ p: 0 }}>
                            {sections.map((section) => {
                                const SectionIcon = section.icon;
                                return (
                                    <ListItemButton
                                        key={section.id}
                                        selected={currentSection === section.id}
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
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>{renderSection()}</Box>
                </Box>
            </DefaultErrorBoundary>
        </MainCard>
    );
}

export default UserDashboard;
