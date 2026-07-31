import PropTypes from 'prop-types';

// mui
import { Alert, Box, CircularProgress, Divider, List, ListItemButton, ListItemIcon, ListItemText, useMediaQuery } from '@mui/material';

// project imports
import MainCard from './cards/MainCard';
import DefaultErrorBoundary from './DefaultErrorBoundary';

// ===========================|| DASHBOARD SHELL ||=========================== //

/*
 * Shared layout for the site admin / site curator / user dashboards: a titled
 * MainCard containing an optional header, a left-hand section navigation list,
 * and the active section body. Handles the loading spinner and a single
 * "notice" state (used for both the unauthorized alert and load errors) so the
 * three dashboards stay visually in sync.
 *
 * - loading: show a centered spinner
 * - notice: { severity, message } — render this alert instead of the body
 * - header: optional node rendered above the nav/body split (e.g. a username)
 * - sections: [{ id, label, icon }]
 * - renderSection(): the active section's content
 */
function DashboardShell({ title, loading, notice, header, sections, activeSection, onSelectSection, renderSection }) {
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down('md'));

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (notice) {
        return (
            <MainCard title={title}>
                <Alert severity={notice.severity || 'error'}>{notice.message}</Alert>
            </MainCard>
        );
    }

    return (
        <MainCard title={title}>
            {header}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
                    <List component="nav" sx={{ p: 0 }}>
                        {sections.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <ListItemButton
                                    key={section.id}
                                    selected={activeSection === section.id}
                                    onClick={() => onSelectSection(section.id)}
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

DashboardShell.propTypes = {
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    notice: PropTypes.shape({ severity: PropTypes.string, message: PropTypes.node }),
    header: PropTypes.node,
    sections: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, label: PropTypes.string, icon: PropTypes.elementType })),
    activeSection: PropTypes.string,
    onSelectSection: PropTypes.func,
    renderSection: PropTypes.func
};

export default DashboardShell;
