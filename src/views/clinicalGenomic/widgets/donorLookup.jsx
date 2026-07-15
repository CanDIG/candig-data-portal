import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/system';

import { fetchFederation } from '../../../store/api';

/*
 * A small form, shown beneath the clinical metadata folders, that lets a user jump
 * to a specific donor. Node and program are dropdowns limited to what the user is
 * actually authorized for (from v3/authorized/programs). Once a program is chosen we
 * load the donors the user may read in that program (v3/authorized/donors/) and offer
 * them as a searchable dropdown, so a valid ID in the wrong program is impossible.
 *
 * Because the donor is picked from the authorized list, it is guaranteed to exist and
 * be accessible, so we can navigate straight to the patient view without re-fetching
 * (which, on a real deployment, would come back as an aggregate 404 for anything a node
 * cannot return and be surfaced as a generic error).
 */

// katsu returns list results as a plain array; the mock nests them under `items`.
function resultItems(results) {
    if (Array.isArray(results)) return results;
    return Array.isArray(results?.items) ? results.items : [];
}

function DonorLookup() {
    const theme = useTheme();

    const [programsByNode, setProgramsByNode] = useState({});
    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [node, setNode] = useState('');
    const [programId, setProgramId] = useState('');
    const [donorId, setDonorId] = useState('');

    // Donor IDs available in the selected node+program, cached by `${node}|||${program}`.
    const [donorCache, setDonorCache] = useState({});
    const [loadingDonors, setLoadingDonors] = useState(false);
    const [donorLoadError, setDonorLoadError] = useState('');

    const [error, setError] = useState('');

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
                    const ids = resultItems(entry.results)
                        .map((program) => program?.program_id)
                        .filter(Boolean);
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

    const cacheKey = node && programId ? `${node}|||${programId}` : '';

    // When a node+program is chosen, load the donors the user may read there.
    useEffect(() => {
        if (!cacheKey || donorCache[cacheKey]) return undefined;
        let active = true;
        setLoadingDonors(true);
        setDonorLoadError('');
        // Plain fetch so a katsu 401 doesn't reload the page mid-selection.
        fetchFederation('v3/authorized/donors/', 'katsu', { program_id: programId }, fetch)
            .then((data) => {
                if (!active) return;
                const match = Array.isArray(data) ? data.find((obj) => obj?.location?.name === node) : null;
                const ids = resultItems(match?.results)
                    .map((donor) => donor?.submitter_donor_id)
                    .filter(Boolean);
                setDonorCache((prev) => ({ ...prev, [cacheKey]: Array.from(new Set(ids)).sort() }));
            })
            .catch(() => {
                if (active) setDonorLoadError('Could not load the donors for this program.');
            })
            .finally(() => {
                if (active) setLoadingDonors(false);
            });
        return () => {
            active = false;
        };
    }, [cacheKey, node, programId, donorCache]);

    const nodes = Object.keys(programsByNode).sort();
    const programs = node ? programsByNode[node] || [] : [];
    const donorOptions = cacheKey ? donorCache[cacheKey] || [] : [];
    const canSubmit = Boolean(node && programId && donorId && donorOptions.includes(donorId));

    const handleNodeChange = (value) => {
        setNode(value);
        setProgramId(''); // program list depends on the node, so reset it
        setDonorId('');
        setError('');
    };

    const handleProgramChange = (value) => {
        setProgramId(value);
        setDonorId(''); // donor list depends on the program, so reset it
        setError('');
    };

    const handleLookup = () => {
        setError('');
        // donorId came from the authorized list for this node+program, so it is known-good.
        if (!donorOptions.includes(donorId)) {
            setError('Please choose a donor from the list.');
            return;
        }
        window.location.href =
            `/patientView?patientId=${encodeURIComponent(donorId)}` +
            `&programId=${encodeURIComponent(programId)}` +
            `&location=${encodeURIComponent(node)}` +
            `&submitterDonorId=${encodeURIComponent(donorId)}`;
    };

    return (
        <Box data-tour="patient-donor-lookup" sx={{ mt: 2, pt: 1.5, px: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
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
                        onChange={(event) => handleProgramChange(event.target.value)}
                        disabled={!node}
                        helperText={node ? '' : 'Select a node first'}
                    >
                        {programs.map((id) => (
                            <MenuItem key={id} value={id}>
                                {id}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Autocomplete
                        size="small"
                        options={donorOptions}
                        value={donorId || null}
                        onChange={(event, value) => {
                            setDonorId(value || '');
                            setError('');
                        }}
                        disabled={!programId || loadingDonors}
                        loading={loadingDonors}
                        noOptionsText={donorLoadError || 'No donors found'}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Donor ID"
                                helperText={
                                    // eslint-disable-next-line no-nested-ternary
                                    !programId
                                        ? 'Select a program first'
                                        : loadingDonors
                                        ? 'Loading donors…'
                                        : `${donorOptions.length} donor${donorOptions.length === 1 ? '' : 's'} available`
                                }
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingDonors ? <CircularProgress color="inherit" size={16} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                    />

                    {donorLoadError && (
                        <Alert severity="error" variant="outlined">
                            {donorLoadError}
                        </Alert>
                    )}

                    <Button type="submit" variant="contained" size="small" disabled={!canSubmit}>
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
