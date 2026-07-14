import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/system';

import { fetchFederation } from '../../../store/api';

/*
 * A small form, shown beneath the clinical metadata folders, that lets a user jump
 * to a specific donor. Node and program are dropdowns limited to what the user is
 * actually authorized for (from v3/authorized/programs); donor ID is free text.
 *
 * Authorization is still enforced by katsu on fetch: the donor endpoint returns 404
 * ("does not exist or inaccessible") for anything the user cannot see, so we only
 * navigate on a real hit and otherwise show an error without revealing any data.
 */
function DonorLookup() {
    const theme = useTheme();

    const [programsByNode, setProgramsByNode] = useState({});
    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [node, setNode] = useState('');
    const [programId, setProgramId] = useState('');
    const [donorId, setDonorId] = useState('');
    const [error, setError] = useState('');
    const [looking, setLooking] = useState(false);

    // Build a { nodeName: [program_id, ...] } map of what the user may access.
    useEffect(() => {
        let active = true;
        // Plain fetch (not the relogin wrapper) so a katsu 401 doesn't reload the page.
        fetchFederation('v3/authorized/programs', 'katsu', {}, fetch)
            .then((data) => {
                if (!active) return;
                const map = {};
                (Array.isArray(data) ? data : []).forEach((entry) => {
                    const name = entry?.location?.name;
                    if (!name) return;
                    // katsu returns results as an array; the mock nests it under items.
                    const items = Array.isArray(entry.results) ? entry.results : entry.results?.items || [];
                    const ids = items.map((program) => program?.program_id).filter(Boolean);
                    if (ids.length === 0) return;
                    map[name] = Array.from(new Set([...(map[name] || []), ...ids])).sort();
                });
                setProgramsByNode(map);
            })
            .catch(() => {
                if (active) setLoadError('Could not load the list of authorized programs.');
            })
            .finally(() => {
                if (active) setLoadingPrograms(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const nodes = Object.keys(programsByNode).sort();
    const programs = node ? programsByNode[node] || [] : [];
    const canSubmit = node && programId && donorId.trim() && !looking;

    const handleNodeChange = (value) => {
        setNode(value);
        setProgramId(''); // program list depends on the node, so reset it
        setError('');
    };

    const handleLookup = async () => {
        setError('');
        setLooking(true);
        const trimmedDonor = donorId.trim();

        try {
            const path = `v3/authorized/donor_with_clinical_data/program/${encodeURIComponent(
                programId
            )}/donor/${encodeURIComponent(trimmedDonor)}`;
            const result = await fetchFederation(path, 'katsu');

            const match = Array.isArray(result) ? result.find((obj) => obj?.location?.name === node) : null;
            const donor = match?.results;
            const found = donor && !donor.error && (donor.submitter_donor_id || donor.program_id);

            if (found) {
                window.location.href =
                    `/patientView?patientId=${encodeURIComponent(trimmedDonor)}` +
                    `&programId=${encodeURIComponent(programId)}` +
                    `&location=${encodeURIComponent(node)}` +
                    `&submitterDonorId=${encodeURIComponent(trimmedDonor)}`;
            } else {
                setError(
                    `No donor "${trimmedDonor}" found in program "${programId}" at "${node}". ` +
                        `Check the donor ID — the donor may not exist or may not be accessible to you.`
                );
            }
        } catch (e) {
            setError('Something went wrong looking up that donor. Please try again.');
        } finally {
            setLooking(false);
        }
    };

    return (
        <Box sx={{ mt: 2, pt: 1.5, px: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Look up donor by ID
            </Typography>

            {loadingPrograms ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2">Loading your programs…</Typography>
                </Box>
            ) : loadError ? (
                <Alert severity="error" variant="outlined">
                    {loadError}
                </Alert>
            ) : nodes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    You do not have access to any programs to look up.
                </Typography>
            ) : (
                <Box
                    component="form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (canSubmit) handleLookup();
                    }}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                >
                    <TextField
                        select
                        size="small"
                        label="Node"
                        value={node}
                        onChange={(event) => handleNodeChange(event.target.value)}
                    >
                        {nodes.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Program"
                        value={programId}
                        onChange={(event) => {
                            setProgramId(event.target.value);
                            setError('');
                        }}
                        disabled={!node}
                        helperText={node ? '' : 'Select a node first'}
                    >
                        {programs.map((id) => (
                            <MenuItem key={id} value={id}>
                                {id}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        label="Donor ID"
                        value={donorId}
                        onChange={(event) => setDonorId(event.target.value)}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={!canSubmit}
                        startIcon={looking ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        Look up donor
                    </Button>

                    {error && (
                        <Alert severity="error" variant="outlined">
                            {error}
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default DonorLookup;
