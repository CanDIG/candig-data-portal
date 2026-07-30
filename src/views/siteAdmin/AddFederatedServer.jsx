import { useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { Alert, Box, Button, Grid, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { IconClipboardCheck, IconServerBolt } from '@tabler/icons-react';

// project imports
import { addFederatedServer } from '../../store/api';

// Canonical Canadian provinces/territories and their CanDIG province codes. The
// province is chosen from this list and the code is derived from it, so the two
// can never disagree.
const PROVINCES = [
    { name: 'Alberta', code: 'ca-ab' },
    { name: 'British Columbia', code: 'ca-bc' },
    { name: 'Manitoba', code: 'ca-mb' },
    { name: 'New Brunswick', code: 'ca-nb' },
    { name: 'Newfoundland and Labrador', code: 'ca-nl' },
    { name: 'Northwest Territories', code: 'ca-nt' },
    { name: 'Nova Scotia', code: 'ca-ns' },
    { name: 'Nunavut', code: 'ca-nu' },
    { name: 'Ontario', code: 'ca-on' },
    { name: 'Prince Edward Island', code: 'ca-pe' },
    { name: 'Quebec', code: 'ca-qc' },
    { name: 'Saskatchewan', code: 'ca-sk' },
    { name: 'Yukon', code: 'ca-yt' }
];

const provinceCodeFor = (name) => PROVINCES.find((p) => p.name === name)?.code || '';

// Resolve a free-form province/code (e.g. from pasted JSON) to a canonical
// province name, matching on either the name or the code. Returns '' if neither
// matches, so the user is prompted to pick one.
function resolveProvince(province, code) {
    const byName = PROVINCES.find((p) => p.name.toLowerCase() === String(province || '').toLowerCase());
    if (byName) {
        return byName.name;
    }
    const byCode = PROVINCES.find((p) => p.code.toLowerCase() === String(code || '').toLowerCase());
    return byCode ? byCode.name : '';
}

// Parse a pasted JSON blob into flat form fields. Accepts the full POST /servers
// body ({ server, authentication }) or just the inner server object.
function parseServerJson(text) {
    const data = JSON.parse(text);
    const server = data.server || data;
    if (!server || typeof server !== 'object') {
        throw new Error('Expected an object with a "server" property.');
    }
    const auth = data.authentication || {};
    const location = server.location || {};
    return {
        id: server.id || '',
        url: server.url || '',
        name: location.name || '',
        province: resolveProvince(location.province, location['province-code']),
        issuer: auth.issuer || '',
        token: auth.token || ''
    };
}

const JSON_PLACEHOLDER = `{
  "server": {
    "id": "uhn-federation-1",
    "url": "https://candig.example.ca",
    "location": { "name": "UHN", "province": "Ontario", "province-code": "ca-on" }
  },
  "authentication": {
    "issuer": "https://candig.example.ca/auth/realms/candig",
    "token": "<access token from the peer node>"
  }
}`;

// ===========================|| ADD FEDERATED SERVER ||=========================== //

/*
 * Register a peer CanDIG node with this node's federation service. The admin can
 * either fill in the form directly or paste the JSON body produced by the
 * add_federated_server tooling; pasting populates the form so the details can be
 * confirmed (and edited) before submitting. On success the federation service
 * also wires the peer's issuer into Tyk and OPA automatically.
 */
function AddFederatedServer({ onSuccess }) {
    const [mode, setMode] = useState('form'); // 'form' | 'json'
    const [id, setId] = useState('');
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [province, setProvince] = useState('');
    const [issuer, setIssuer] = useState('');
    const [token, setToken] = useState('');
    const [jsonText, setJsonText] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const provinceCode = provinceCodeFor(province);

    // Every field maps directly onto a required part of the POST /servers body.
    const requiredFilled = id.trim() && url.trim() && name.trim() && province && issuer.trim() && token.trim();

    // Parse the pasted JSON into the form fields, then switch to the form so the
    // admin can confirm/adjust before submitting.
    const handlePopulateFromJson = () => {
        setFeedback(null);
        try {
            const parsed = parseServerJson(jsonText);
            setId(parsed.id);
            setUrl(parsed.url);
            setName(parsed.name);
            setProvince(parsed.province);
            setIssuer(parsed.issuer);
            setToken(parsed.token);
            setMode('form');
            const warnings = [];
            if (!parsed.province) {
                warnings.push('province was not recognised — please pick one');
            }
            setFeedback({
                severity: warnings.length ? 'warning' : 'success',
                text: `Form populated from JSON${warnings.length ? ` (${warnings.join('; ')})` : '. Review the details and submit.'}`
            });
        } catch (error) {
            setFeedback({ severity: 'error', text: `Could not parse JSON. ${error.message}` });
        }
    };

    const handleSubmit = () => {
        if (!requiredFilled) {
            setFeedback({ severity: 'warning', text: 'All fields are required to register a node.' });
            return;
        }

        const payload = {
            server: {
                id: id.trim(),
                url: url.trim(),
                location: {
                    name: name.trim(),
                    province,
                    'province-code': provinceCode
                }
            },
            authentication: {
                issuer: issuer.trim(),
                token: token.trim()
            }
        };

        setBusy(true);
        setFeedback(null);
        addFederatedServer(payload)
            .then(() => {
                setFeedback({ severity: 'success', text: `Registered node "${id.trim()}".` });
                setId('');
                setUrl('');
                setName('');
                setProvince('');
                setIssuer('');
                setToken('');
                setJsonText('');
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch((error) => setFeedback({ severity: 'error', text: `Could not register node. ${error}` }))
            .finally(() => setBusy(false));
    };

    return (
        <Box>
            <Typography variant="h4" mb={1}>
                Add Federated Node
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
                Register a peer CanDIG node so its data is included in federated queries. Fill in the form, or paste a JSON blob to
                populate it. You will need the peer&apos;s Keycloak issuer URL and a valid access token issued by that peer.
            </Typography>

            <ToggleButtonGroup
                value={mode}
                exclusive
                size="small"
                onChange={(_event, next) => next && setMode(next)}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="form">Form</ToggleButton>
                <ToggleButton value="json">Paste JSON</ToggleButton>
            </ToggleButtonGroup>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            {mode === 'json' ? (
                <Grid container spacing={2} sx={{ maxWidth: 820 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Server JSON"
                            placeholder={JSON_PLACEHOLDER}
                            helperText="Paste the { server, authentication } body. Populating the form lets you confirm the details before submitting."
                            value={jsonText}
                            onChange={(event) => setJsonText(event.target.value)}
                            multiline
                            minRows={10}
                            fullWidth
                            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={<IconClipboardCheck size="1rem" />}
                                disabled={busy || jsonText.trim().length === 0}
                                onClick={handlePopulateFromJson}
                            >
                                Populate Form
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2} sx={{ maxWidth: 820 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Server id"
                            placeholder="uhn-federation-1"
                            helperText="Unique identifier for this node."
                            value={id}
                            onChange={(event) => setId(event.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Server URL"
                            placeholder="https://candig.example.ca"
                            helperText="Base URL of the peer node."
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Location name"
                            placeholder="UHN"
                            helperText="Display name for the node."
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            label="Province"
                            value={province}
                            onChange={(event) => setProvince(event.target.value)}
                            fullWidth
                            required
                        >
                            {PROVINCES.map((p) => (
                                <MenuItem key={p.code} value={p.name}>
                                    {p.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Province code"
                            value={provinceCode}
                            helperText="Set automatically from the province."
                            fullWidth
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Keycloak issuer URL"
                            placeholder="https://candig.example.ca/auth/realms/candig"
                            helperText="The peer's OIDC issuer."
                            value={issuer}
                            onChange={(event) => setIssuer(event.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Access token"
                            placeholder="Access token issued by the peer node"
                            helperText="Used once at registration to validate and authorize the peer."
                            value={token}
                            onChange={(event) => setToken(event.target.value)}
                            multiline
                            minRows={2}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={<IconServerBolt size="1rem" />}
                                disabled={busy || !requiredFilled}
                                onClick={handleSubmit}
                            >
                                Register Node
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

AddFederatedServer.propTypes = {
    onSuccess: PropTypes.func
};

export default AddFederatedServer;
