import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { IconRefresh, IconServerBolt, IconTrash } from '@tabler/icons-react';

// project imports
import { deleteFederatedServer, fetchFederatedServers, fetchNodeStatus } from '../../store/api';

// Key a node by location name + province so two nodes sharing a name (but in
// different provinces) don't collide when merging live status onto the registry.
const locationKey = (location) => `${(location?.name || '').toLowerCase()}||${(location?.province || '').toLowerCase()}`;

// Build a lookup of node status keyed by location. The status probe returns one
// entry per registered node: { location: { name, province }, status }.
function indexStatusByLocation(statusArray) {
    const byLocation = new Map();
    (Array.isArray(statusArray) ? statusArray : []).forEach((entry) => {
        if (entry?.location?.name) {
            byLocation.set(locationKey(entry.location), entry);
        }
    });
    return byLocation;
}

// Classify a raw fanout status code into a display state. A missing probe entry
// means the node was never contacted, so its reachability is unknown.
function classifyStatus(entry) {
    if (!entry || entry.status === undefined) {
        return { label: 'Unknown', color: 'default', message: 'No status returned for this node.' };
    }
    if (entry.status === 200) {
        return { label: 'Connected', color: 'success', message: '' };
    }
    return { label: 'Unreachable', color: 'error', message: entry.message || `Status ${entry.status}` };
}

// ===========================|| FEDERATED NODES ||=========================== //

/*
 * Show every peer node registered with this node's federation service, annotated
 * with a live Connected / Unreachable status derived from a fanout probe. A site
 * admin can select one or more nodes and unregister them (behind a confirmation
 * dialog), or jump to the Add Federated Node form.
 */
function FederatedNodes({ onNavigate }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [selection, setSelection] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const loadNodes = useCallback(() => {
        setLoading(true);
        // The registry is the source of truth for which nodes exist; the probe
        // only annotates them, so a failed probe should still show the nodes.
        return Promise.all([fetchFederatedServers(), fetchNodeStatus().catch(() => [])])
            .then(([servers, statusArray]) => {
                const statusByName = indexStatusByLocation(statusArray);
                const nextRows = servers.map((server) => {
                    const location = server?.location || {};
                    const status = classifyStatus(location.name ? statusByName.get(locationKey(location)) : undefined);
                    return {
                        id: server.id,
                        name: location.name || '',
                        province: location.province || '',
                        url: server.url || '',
                        statusLabel: status.label,
                        statusColor: status.color,
                        statusMessage: status.message
                    };
                });
                setRows(nextRows);
                setSelection([]);
            })
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load federated nodes. ${error}` }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadNodes();
    }, [loadNodes]);

    const handleDeleteSelected = () => {
        setConfirmOpen(false);
        setBusy(true);
        setFeedback(null);
        // The federation service deletes a single server per call. Run them
        // independently so one failure doesn't abort the rest, report per-node
        // outcomes, and always refresh so partial deletions are reflected.
        const ids = [...selection];
        Promise.allSettled(ids.map((serverId) => deleteFederatedServer(serverId)))
            .then((results) => {
                const failed = [];
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        failed.push(`${ids[index]} (${result.reason})`);
                    }
                });
                const succeeded = ids.length - failed.length;
                if (failed.length === 0) {
                    setFeedback({ severity: 'success', text: `Unregistered ${succeeded} node(s).` });
                } else if (succeeded === 0) {
                    setFeedback({ severity: 'error', text: `Could not unregister: ${failed.join('; ')}` });
                } else {
                    setFeedback({ severity: 'warning', text: `Unregistered ${succeeded} node(s). Failed: ${failed.join('; ')}` });
                }
                return loadNodes();
            })
            .finally(() => setBusy(false));
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
        { field: 'province', headerName: 'Province', flex: 1, minWidth: 120 },
        { field: 'id', headerName: 'Server ID', flex: 1, minWidth: 160 },
        {
            field: 'url',
            headerName: 'URL',
            flex: 2,
            minWidth: 240,
            renderCell: (params) => (
                <Tooltip title={params.value || ''} placement="top-start">
                    <span>{params.value}</span>
                </Tooltip>
            )
        },
        {
            field: 'statusLabel',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <Tooltip title={params.row.statusMessage || ''} placement="top">
                    <Chip label={params.value} size="small" color={params.row.statusColor} variant="outlined" />
                </Tooltip>
            )
        }
    ];

    const selectedNames = rows.filter((row) => selection.includes(row.id)).map((row) => row.id);

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
                <Typography variant="h4">Federated Nodes</Typography>
                <Chip label={rows.length} size="small" color="primary" />
                <Box flexGrow={1} />
                <Button
                    variant="contained"
                    startIcon={<IconServerBolt size="1rem" />}
                    onClick={() => onNavigate && onNavigate('add-node')}
                    disabled={!onNavigate}
                >
                    Add Node
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<IconTrash size="1rem" />}
                    disabled={busy || selection.length === 0}
                    onClick={() => setConfirmOpen(true)}
                >
                    Unregister Selected ({selection.length})
                </Button>
                <Button startIcon={<IconRefresh size="1rem" />} onClick={loadNodes} disabled={loading || busy}>
                    Refresh
                </Button>
            </Stack>

            <Typography variant="body2" color="textSecondary" mb={2}>
                Registered peer nodes and their current reachability. Status is derived from a live query fanned out to every node.
            </Typography>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Box sx={{ height: 520, width: '100%' }}>
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
                    localeText={{ noRowsLabel: 'No federated nodes registered' }}
                />
            </Box>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Unregister node(s)?</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        This will remove the following node(s) from federation. They will no longer be included in federated queries.
                        <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                            {selectedNames.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </Box>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteSelected} startIcon={<IconTrash size="1rem" />}>
                        Unregister
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

FederatedNodes.propTypes = {
    onNavigate: PropTypes.func
};

export default FederatedNodes;
