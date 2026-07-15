import { useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { Alert, Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { IconLibraryPlus } from '@tabler/icons-react';

// project imports
import { addProgram, fetchProgram } from '../../store/api';

// Split a free-text field into a lower-cased, de-duplicated list of user ids.
function parseUserList(value) {
    return [
        ...new Set(
            value
                .split(/[\s,;]+/)
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean)
        )
    ];
}

// ===========================|| REGISTER PROGRAM ||=========================== //

/*
 * Register a brand-new program. If a program with the same id already exists the
 * portal rejects the request (rather than overwriting it) and points the user to
 * the Manage Programs section to edit it instead.
 */
function RegisterProgram({ onNavigate }) {
    const [programId, setProgramId] = useState('');
    const [curators, setCurators] = useState('');
    const [teamMembers, setTeamMembers] = useState('');
    const [creationDate, setCreationDate] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [duplicate, setDuplicate] = useState(false);

    const handleSubmit = () => {
        const id = programId.trim();
        if (!id) {
            setFeedback({ severity: 'warning', text: 'A program id is required.' });
            return;
        }

        setBusy(true);
        setFeedback(null);
        setDuplicate(false);

        // Reject registration if the program already exists.
        fetchProgram(id)
            .then((response) => {
                if (response.ok) {
                    setDuplicate(true);
                    setFeedback({
                        severity: 'error',
                        text: `Program "${id}" already exists. Use Manage Programs to edit its curators and team members.`
                    });
                    return undefined;
                }
                if (response.status !== 404) {
                    const detail = response.data?.error || response.data?.message || response.status;
                    setFeedback({ severity: 'error', text: `Could not verify program "${id}". ${detail}` });
                    return undefined;
                }

                // 404 => safe to create.
                const program = {
                    program_id: id,
                    program_curators: parseUserList(curators),
                    team_members: parseUserList(teamMembers)
                };
                if (creationDate) {
                    program.creation_date = creationDate;
                }
                return addProgram(program).then(() => {
                    setFeedback({ severity: 'success', text: `Registered program ${id}.` });
                    setProgramId('');
                    setCurators('');
                    setTeamMembers('');
                    setCreationDate('');
                });
            })
            .catch((error) => setFeedback({ severity: 'error', text: `${error}` }))
            .finally(() => setBusy(false));
    };

    return (
        <Box>
            <Typography variant="h4" mb={2}>
                Register Program
            </Typography>

            {feedback && (
                <Alert
                    severity={feedback.severity}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 2 }}
                    action={
                        duplicate && onNavigate ? (
                            <Button color="inherit" size="small" onClick={() => onNavigate('program')}>
                                Go to Manage Programs
                            </Button>
                        ) : undefined
                    }
                >
                    {feedback.text}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ maxWidth: 720 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Program id"
                        value={programId}
                        onChange={(event) => {
                            setProgramId(event.target.value);
                            setDuplicate(false);
                        }}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Creation date"
                        type="date"
                        value={creationDate}
                        onChange={(event) => setCreationDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        helperText="Optional — used for data embargo purposes."
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Program curators"
                        placeholder="curator1@example.com, curator2@example.com …"
                        helperText="Users who can curate and manage this program."
                        value={curators}
                        onChange={(event) => setCurators(event.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Team members"
                        placeholder="member1@example.com, member2@example.com …"
                        helperText="Users who can read this program's data."
                        value={teamMembers}
                        onChange={(event) => setTeamMembers(event.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button variant="contained" startIcon={<IconLibraryPlus size="1rem" />} disabled={busy} onClick={handleSubmit}>
                            Register Program
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}

RegisterProgram.propTypes = {
    onNavigate: PropTypes.func
};

export default RegisterProgram;
