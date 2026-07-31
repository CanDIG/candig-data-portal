import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { IconRefresh, IconTrash, IconUserPlus } from '@tabler/icons-react';

// project imports
import { addUserToSiteRole, fetchSiteRoleUsers, removeUserFromSiteRole } from '../../store/api';
import useAdminAction from '../../hooks/useAdminAction';
import { adminDataGridProps, parseUserList } from '../../utils/adminHelpers';

// ===========================|| SITE ROLE MANAGER ||=========================== //

/*
 * View and manage the users assigned to a given site role (e.g. "curator" or
 * "admin"). A site admin can add one or many users at once and remove existing
 * ones. Parameterised by role so it can back both the Site Curators and Site
 * Admins sections.
 */
function SiteRoleManager({ roleType, title, description, addLabel, columnHeader, emptyLabel }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const { busy, setBusy, feedback, setFeedback, runAction } = useAdminAction();

    const loadMembers = useCallback(() => {
        setLoading(true);
        return fetchSiteRoleUsers(roleType)
            .then((users) => setMembers(users))
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load ${title.toLowerCase()}. ${error}` }))
            .finally(() => setLoading(false));
    }, [roleType, title, setFeedback]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    const handleAdd = () => {
        const userIds = parseUserList(input);
        if (userIds.length === 0) {
            setFeedback({ severity: 'warning', text: 'Enter at least one user id to add.' });
            return;
        }
        // The ingest service adds a single user per call. Run them independently
        // so one failure doesn't abort the rest, and report per-user outcomes.
        setBusy(true);
        setFeedback(null);
        Promise.allSettled(userIds.map((userId) => addUserToSiteRole(roleType, userId)))
            .then((results) => {
                const failed = [];
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        failed.push(`${userIds[index]} (${result.reason})`);
                    }
                });
                const succeeded = userIds.length - failed.length;
                if (failed.length === 0) {
                    setFeedback({ severity: 'success', text: `Added ${succeeded} ${addLabel}.` });
                    setInput('');
                } else if (succeeded === 0) {
                    setFeedback({ severity: 'error', text: `Failed to add: ${failed.join('; ')}` });
                } else {
                    setFeedback({ severity: 'warning', text: `Added ${succeeded} ${addLabel}. Failed: ${failed.join('; ')}` });
                }
                return loadMembers();
            })
            .finally(() => setBusy(false));
    };

    const handleRemove = (userId) =>
        runAction(() => removeUserFromSiteRole(roleType, userId), `Removed ${userId}.`).then((result) => result.ok && loadMembers());

    const rows = members.map((userId) => ({ id: userId, user_id: userId }));

    const columns = [
        { field: 'user_id', headerName: columnHeader, flex: 1, minWidth: 260 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            minWidth: 140,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<IconTrash size="1rem" />}
                    disabled={busy}
                    onClick={() => handleRemove(params.row.user_id)}
                >
                    Remove
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h4">{title}</Typography>
                <Chip label={members.length} size="small" color="primary" />
                <Box flexGrow={1} />
                <Button startIcon={<IconRefresh size="1rem" />} onClick={loadMembers} disabled={loading || busy}>
                    Refresh
                </Button>
            </Stack>

            {description && (
                <Typography variant="body2" color="textSecondary" mb={2}>
                    {description}
                </Typography>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-start' }} mb={2}>
                <TextField
                    label={`Add ${addLabel}`}
                    placeholder="user1@example.com, user2@example.com …"
                    helperText="Add one or many users, separated by commas, spaces, or new lines."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    multiline
                    minRows={2}
                    fullWidth
                />
                <Button
                    variant="contained"
                    startIcon={<IconUserPlus size="1rem" />}
                    disabled={busy || input.trim().length === 0}
                    onClick={handleAdd}
                    sx={{ minWidth: 140, mt: { xs: 0, md: 0.5 } }}
                >
                    Add
                </Button>
            </Stack>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Box sx={{ height: 420, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    {...adminDataGridProps}
                    localeText={{ noRowsLabel: emptyLabel }}
                />
            </Box>
        </Box>
    );
}

SiteRoleManager.propTypes = {
    roleType: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    addLabel: PropTypes.string.isRequired,
    columnHeader: PropTypes.string.isRequired,
    emptyLabel: PropTypes.string.isRequired
};

export default SiteRoleManager;
