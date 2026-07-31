import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import { Alert, Autocomplete, Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { IconShieldPlus } from '@tabler/icons-react';

// project imports
import { addDacAuthorization, fetchPrograms } from '../../store/api';
import { parseUserList } from '../../utils/adminHelpers';

// ===========================|| ADD DAC AUTHORIZATION ||=========================== //

/*
 * Grant one or more users a time-bounded DAC authorization for one or more
 * programs. A separate authorization is submitted for every user/program
 * combination. Programs are chosen from a multi-select autocomplete populated
 * from the ingest service; dates are validated before submission (the ingest
 * service performs the authoritative validation).
 */
function AddDacAuthorization({ onSuccess }) {
    const [programs, setPrograms] = useState([]);
    const [userIds, setUserIds] = useState('');
    const [programIds, setProgramIds] = useState([]);
    const [dacId, setDacId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        fetchPrograms()
            .then((results) => setPrograms(Array.isArray(results) ? results : []))
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load programs. ${error}` }));
    }, []);

    const validate = (parsedUserIds) => {
        if (parsedUserIds.length === 0 || programIds.length === 0 || !startDate || !endDate) {
            return 'User id(s), at least one program, start date, and end date are required.';
        }
        if (endDate <= startDate) {
            return 'End date must be after the start date.';
        }
        return null;
    };

    const handleSubmit = () => {
        const parsedUserIds = parseUserList(userIds);
        const validationError = validate(parsedUserIds);
        if (validationError) {
            setFeedback({ severity: 'warning', text: validationError });
            return;
        }

        const baseAuthorization = { start_date: startDate, end_date: endDate };
        if (dacId.trim()) {
            baseAuthorization.dac_id = dacId.trim();
        }

        // One authorization per user/program combination.
        const pairs = [];
        parsedUserIds.forEach((userId) => {
            programIds.forEach((programId) => pairs.push({ userId, programId }));
        });

        setBusy(true);
        setFeedback(null);
        Promise.allSettled(
            pairs.map(({ userId, programId }) => addDacAuthorization(userId, { ...baseAuthorization, program_id: programId }))
        )
            .then((results) => {
                const failed = [];
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        const { userId, programId } = pairs[index];
                        failed.push(`${userId}/${programId} (${result.reason})`);
                    }
                });
                const succeededCount = pairs.length - failed.length;

                if (failed.length === 0) {
                    setFeedback({
                        severity: 'success',
                        text: `Created ${succeededCount} authorization(s) for ${parsedUserIds.length} user(s) across ${programIds.length} program(s).`
                    });
                    setUserIds('');
                    setProgramIds([]);
                    setDacId('');
                    setStartDate('');
                    setEndDate('');
                    if (onSuccess) {
                        onSuccess();
                    }
                } else if (succeededCount === 0) {
                    setFeedback({ severity: 'error', text: `Failed to authorize: ${failed.join('; ')}` });
                } else {
                    setFeedback({
                        severity: 'warning',
                        text: `Created ${succeededCount} authorization(s). Failed: ${failed.join('; ')}`
                    });
                }
            })
            .finally(() => setBusy(false));
    };

    return (
        <Box>
            <Typography variant="h4" mb={2}>
                Add DAC Authorization
            </Typography>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            <Grid container spacing={2} sx={{ maxWidth: 720 }}>
                <Grid item xs={12}>
                    <TextField
                        label="User id(s)"
                        placeholder="user1@example.com, user2@example.com …"
                        helperText="Add one or many users, separated by commas, spaces, or new lines. A separate authorization is created for each user/program combination."
                        value={userIds}
                        onChange={(event) => setUserIds(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Autocomplete
                        multiple
                        options={programs}
                        value={programIds}
                        onChange={(event, newValue) => setProgramIds(newValue)}
                        filterSelectedOptions
                        disableCloseOnSelect
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Program(s)"
                                placeholder={programIds.length === 0 ? 'Select one or more programs' : ''}
                                required
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="DAC id"
                        value={dacId}
                        onChange={(event) => setDacId(event.target.value)}
                        helperText="Optional — identifier of the authorizing Data Access Committee."
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={6} />
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Start date"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="End date"
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end">
                        <Button variant="contained" startIcon={<IconShieldPlus size="1rem" />} disabled={busy} onClick={handleSubmit}>
                            Add Authorization
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
}

AddDacAuthorization.propTypes = {
    onSuccess: PropTypes.func
};

export default AddDacAuthorization;
