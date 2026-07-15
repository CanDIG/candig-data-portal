import { useCallback, useEffect, useState } from 'react';

// mui
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconCheck, IconRefresh, IconX } from '@tabler/icons-react';

// project imports
import { approvePendingUser, approvePendingUsers, fetchPendingUsers, rejectPendingUser } from '../../store/api';

// ===========================|| PENDING USERS ||=========================== //

/*
 * Lists users awaiting CanDIG authorization. A site admin can approve or reject
 * individual users, approve the current selection, or approve everyone at once.
 */
function PendingUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [selection, setSelection] = useState([]);
    const [feedback, setFeedback] = useState(null);

    const loadUsers = useCallback(() => {
        setLoading(true);
        return fetchPendingUsers()
            .then((results) => {
                setUsers(results);
                setSelection([]);
            })
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load pending users. ${error}` }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Run an action, refresh the list, and surface a success/error message.
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

    const handleApprove = (userId) => runAction(() => approvePendingUser(userId), `Approved ${userId}.`);
    const handleReject = (userId) => runAction(() => rejectPendingUser(userId), `Rejected ${userId}.`);
    const handleApproveSelected = () =>
        runAction(() => approvePendingUsers(selection), `Approved ${selection.length} user(s).`);
    const handleApproveAll = () =>
        runAction(() => approvePendingUsers(users.map((u) => u.user_name)), `Approved all ${users.length} pending user(s).`);

    const rows = users.map((user) => ({ id: user.user_name, user_name: user.user_name }));

    const columns = [
        { field: 'user_name', headerName: 'User', flex: 1, minWidth: 260 },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filterable: false,
            minWidth: 220,
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<IconCheck size="1rem" />}
                        disabled={busy}
                        onClick={() => handleApprove(params.row.user_name)}
                    >
                        Approve
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<IconX size="1rem" />}
                        disabled={busy}
                        onClick={() => handleReject(params.row.user_name)}
                    >
                        Reject
                    </Button>
                </Stack>
            )
        }
    ];

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                <Typography variant="h4">Pending Users</Typography>
                <Chip label={users.length} size="small" color="primary" />
                <Box flexGrow={1} />
                <Button startIcon={<IconRefresh size="1rem" />} onClick={loadUsers} disabled={loading || busy}>
                    Refresh
                </Button>
                <Button variant="outlined" disabled={busy || selection.length === 0} onClick={handleApproveSelected}>
                    Approve Selected ({selection.length})
                </Button>
                <Button variant="contained" disabled={busy || users.length === 0} onClick={handleApproveAll}>
                    Approve All
                </Button>
            </Stack>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Box sx={{ height: 460, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    checkboxSelection
                    disableRowSelectionOnClick
                    rowSelectionModel={selection}
                    onRowSelectionModelChange={(model) => setSelection(model)}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    localeText={{ noRowsLabel: 'No pending users' }}
                />
            </Box>
        </Box>
    );
}

export default PendingUsers;
