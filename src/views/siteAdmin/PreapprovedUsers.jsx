import { useCallback, useEffect, useState } from 'react';

// mui
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconRefresh, IconTrash, IconUserPlus } from '@tabler/icons-react';

// project imports
import { addPreapprovedUsers, fetchPreapprovedUsers, removePreapprovedUser } from '../../store/api';

// ===========================|| PREAPPROVED USERS ||=========================== //

/*
 * Preapproved users are automatically authorized when they first request access.
 * A site admin can view the current list, add one or many users at once
 * (comma / whitespace / newline separated), and remove entries.
 */
function PreapprovedUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null);

    const loadUsers = useCallback(() => {
        setLoading(true);
        return fetchPreapprovedUsers()
            .then((results) => setUsers(results))
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load preapproved users. ${error}` }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const runAction = (action, successText) => {
        setBusy(true);
        setFeedback(null);
        return action()
            .then(() => {
                setFeedback({ severity: 'success', text: successText });
                return loadUsers();
            })
            .catch((error) => setFeedback({ severity: 'error', text: `${error}` }))
            .finally(() => setBusy(false));
    };

    const handleAdd = () => {
        // Accept commas, semicolons, and any whitespace as separators.
        const userIds = input
            .split(/[\s,;]+/)
            .map((value) => value.trim())
            .filter(Boolean);
        if (userIds.length === 0) {
            setFeedback({ severity: 'warning', text: 'Enter at least one user id to add.' });
            return;
        }
        runAction(() => addPreapprovedUsers(userIds), `Added ${userIds.length} preapproved user(s).`).then(() => setInput(''));
    };

    const handleRemove = (userId) => runAction(() => removePreapprovedUser(userId), `Removed ${userId}.`);

    const rows = users.map((user) => ({ id: user.user_name, user_name: user.user_name }));

    const columns = [
        { field: 'user_name', headerName: 'User', flex: 1, minWidth: 260 },
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
                    onClick={() => handleRemove(params.row.user_name)}
                >
                    Remove
                </Button>
            )
        }
    ];

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h4">Preapproved Users</Typography>
                <Chip label={users.length} size="small" color="primary" />
                <Box flexGrow={1} />
                <Button startIcon={<IconRefresh size="1rem" />} onClick={loadUsers} disabled={loading || busy}>
                    Refresh
                </Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-start' }} mb={2}>
                <TextField
                    label="Add users"
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
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    localeText={{ noRowsLabel: 'No preapproved users' }}
                    disableRowSelectionOnClick
                />
            </Box>
        </Box>
    );
}

export default PreapprovedUsers;
