import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { Alert, Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconRefresh, IconShieldPlus } from '@tabler/icons-react';

// project imports
import { fetchAllDacAuthorizations } from '../../store/api';

// Collapse authorizations that share the same program, DAC id, and date range
// into a single row, listing all their users as a comma-delimited string.
function groupDacAuthorizations(authorizations) {
    const groups = new Map();
    authorizations.forEach((dac) => {
        const key = [dac.program_id, dac.dac_id, dac.start_date, dac.end_date].join('||');
        if (!groups.has(key)) {
            groups.set(key, {
                program_id: dac.program_id,
                dac_id: dac.dac_id,
                start_date: dac.start_date,
                end_date: dac.end_date,
                userSet: new Set()
            });
        }
        if (dac.user_id) {
            groups.get(key).userSet.add(dac.user_id);
        }
    });
    return [...groups.values()].map((group, index) => {
        const users = [...group.userSet].sort();
        return {
            id: index,
            program_id: group.program_id,
            dac_id: group.dac_id,
            start_date: group.start_date,
            end_date: group.end_date,
            user_count: users.length,
            users: users.join(', ')
        };
    });
}

// ===========================|| DAC AUTHORIZATIONS TABLE ||=========================== //

/*
 * A read-only, filterable view of every DAC (Data Access Committee) authorization
 * across all programs. Authorizations that share the same program, DAC id, and
 * date range are collapsed into a single row with their users listed together.
 * The DataGrid toolbar provides quick search, per-column filtering, sorting, and
 * CSV export.
 */
function DacAuthorizationsTable({ onNavigate }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadDacs = useCallback(() => {
        setLoading(true);
        setError(null);
        return fetchAllDacAuthorizations()
            .then((authorizations) => setRows(groupDacAuthorizations(authorizations)))
            .catch((err) => setError(`Could not load DAC authorizations. ${err}`))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadDacs();
    }, [loadDacs]);

    const columns = [
        { field: 'program_id', headerName: 'Program', flex: 1, minWidth: 150 },
        {
            field: 'users',
            headerName: 'Users',
            flex: 2,
            minWidth: 280,
            renderCell: (params) => (
                <Tooltip title={params.value || ''} placement="top-start">
                    <span>{params.value}</span>
                </Tooltip>
            )
        },
        { field: 'user_count', headerName: '# Users', width: 90, type: 'number' },
        { field: 'dac_id', headerName: 'DAC ID', flex: 1, minWidth: 130 },
        { field: 'start_date', headerName: 'Start Date', flex: 1, minWidth: 120 },
        { field: 'end_date', headerName: 'End Date', flex: 1, minWidth: 120 }
    ];

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h4">DAC Authorizations</Typography>
                <Chip label={rows.length} size="small" color="primary" />
                <Box flexGrow={1} />
                <Button
                    variant="contained"
                    startIcon={<IconShieldPlus size="1rem" />}
                    onClick={() => onNavigate && onNavigate('add-dac')}
                    disabled={!onNavigate}
                >
                    Add a DAC Authorization
                </Button>
                <Button startIcon={<IconRefresh size="1rem" />} onClick={loadDacs} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ height: 560, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{ toolbar: { showQuickFilter: true } }}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                    localeText={{ noRowsLabel: 'No DAC authorizations found' }}
                    disableRowSelectionOnClick
                />
            </Box>
        </Box>
    );
}

DacAuthorizationsTable.propTypes = {
    onNavigate: PropTypes.func
};

export default DacAuthorizationsTable;
