import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

// mui
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { IconDeviceFloppy, IconSearch } from '@tabler/icons-react';

// project imports
import { addProgram, fetchProgram, fetchProgramDacs, fetchPrograms } from '../../store/api';
import { parseUserList } from '../../utils/adminHelpers';

// Case-insensitive union of two user id lists.
function unionUsers(existing, added) {
    return [...new Set([...existing.map((u) => u.toLowerCase()), ...added])];
}

// ===========================|| MANAGE PROGRAMS ||=========================== //

/*
 * Look up an existing program to see its curators and team members, then either
 * ADD users to those lists or REPLACE them. Because the ingest service fully
 * overwrites a program on POST, the "add" path merges with the existing lists
 * and both paths preserve the program's existing DAC authorizations and other
 * stored fields. Registering brand-new programs is handled by the Register
 * Program section, so a lookup that finds nothing points the user there.
 */
function ManagePrograms({ onNavigate, allowedPrograms, showHeading }) {
    const [programOptions, setProgramOptions] = useState([]);
    const [lookupInput, setLookupInput] = useState('');
    const [looking, setLooking] = useState(false);
    // result of the last lookup: { programId, exists, curators, team, dacs, existing }
    const [result, setResult] = useState(null);

    const [curatorsInput, setCuratorsInput] = useState('');
    const [teamInput, setTeamInput] = useState('');
    const [mode, setMode] = useState('add'); // 'add' | 'replace'

    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);
    // Monotonic id so out-of-order lookup responses (look up A then B quickly)
    // are ignored — only the latest request's result is applied.
    const lookupSeq = useRef(0);

    const loadProgramOptions = useCallback(() => {
        // When restricted to a set of programs (e.g. a program curator managing
        // only their own), use that list directly — a plain program curator is
        // not authorized to list all programs via GET /program.
        if (allowedPrograms) {
            setProgramOptions(allowedPrograms);
            return;
        }
        fetchPrograms()
            .then((programs) => setProgramOptions(Array.isArray(programs) ? programs : []))
            .catch((error) => setFeedback({ severity: 'error', text: `Could not load programs. ${error}` }));
    }, [allowedPrograms]);

    useEffect(() => {
        loadProgramOptions();
    }, [loadProgramOptions]);

    const handleLookup = useCallback(
        (rawId) => {
            const programId = (rawId ?? lookupInput).trim();
            if (!programId) {
                setFeedback({ severity: 'warning', text: 'Enter a program id to look up.' });
                return;
            }
            if (allowedPrograms && !allowedPrograms.includes(programId)) {
                setFeedback({ severity: 'warning', text: 'You can only manage programs you are a curator of.' });
                setResult(null);
                return;
            }
            const requestId = (lookupSeq.current += 1);
            setLooking(true);
            setFeedback(null);
            setCuratorsInput('');
            setTeamInput('');
            setMode('add');
            Promise.all([fetchProgram(programId), fetchProgramDacs(programId).catch(() => ({}))])
                .then(([programResponse, dacs]) => {
                    // Ignore this response if a newer lookup has since started.
                    if (lookupSeq.current !== requestId) {
                        return;
                    }
                    if (programResponse.ok && programResponse.data) {
                        setResult({
                            programId,
                            exists: true,
                            curators: programResponse.data.program_curators || [],
                            team: programResponse.data.team_members || [],
                            dacs: dacs || {},
                            existing: programResponse.data
                        });
                    } else if (programResponse.status === 404) {
                        setResult({ programId, exists: false });
                    } else {
                        const detail = programResponse.data?.error || programResponse.data?.message || programResponse.status;
                        setFeedback({ severity: 'error', text: `Could not look up ${programId}. ${detail}` });
                        setResult(null);
                    }
                })
                .catch((error) => {
                    if (lookupSeq.current !== requestId) {
                        return;
                    }
                    setFeedback({ severity: 'error', text: `Could not look up ${programId}. ${error}` });
                    setResult(null);
                })
                .finally(() => {
                    if (lookupSeq.current === requestId) {
                        setLooking(false);
                    }
                });
        },
        [lookupInput, allowedPrograms]
    );

    const handleSave = () => {
        if (!result || !result.exists) {
            return;
        }
        const newCurators = parseUserList(curatorsInput);
        const newTeam = parseUserList(teamInput);

        const curators = mode === 'add' ? unionUsers(result.curators, newCurators) : newCurators;
        const team = mode === 'add' ? unionUsers(result.team, newTeam) : newTeam;
        // Preserve existing fields (creation date) and DAC authorizations, which
        // are stored inside the same program record and would otherwise be
        // dropped by the overwriting POST.
        const program = {
            ...result.existing,
            program_id: result.programId,
            program_curators: curators,
            team_members: team,
            dac_authorizations: result.dacs || {}
        };

        setBusy(true);
        setFeedback(null);
        addProgram(program)
            .then(() => {
                setFeedback({
                    severity: 'success',
                    text: `${mode === 'add' ? 'Added users to' : 'Replaced users on'} program ${result.programId}.`
                });
                handleLookup(result.programId); // refresh the displayed lists
            })
            .catch((error) => setFeedback({ severity: 'error', text: `${error}` }))
            .finally(() => setBusy(false));
    };

    const renderUserChips = (users) =>
        users.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {users.map((user) => (
                    <Chip key={user} label={user} size="small" />
                ))}
            </Stack>
        ) : (
            <Typography variant="body2" color="textSecondary">
                None
            </Typography>
        );

    return (
        <Box>
            {showHeading && (
                <Typography variant="h4" mb={2}>
                    Manage Programs
                </Typography>
            )}

            {/* Lookup */}
            <Typography variant="subtitle1" mb={1}>
                Look up program
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
                <Autocomplete
                    freeSolo
                    options={programOptions}
                    inputValue={lookupInput}
                    onInputChange={(event, value) => setLookupInput(value)}
                    onChange={(event, value) => value && handleLookup(value)}
                    sx={{ width: { xs: '100%', sm: 360 } }}
                    renderInput={(params) => <TextField {...params} label="Program id" placeholder="Enter or select a program id" />}
                />
                <Button
                    variant="contained"
                    startIcon={<IconSearch size="1rem" />}
                    onClick={() => handleLookup()}
                    disabled={looking || lookupInput.trim().length === 0}
                >
                    Look Up
                </Button>
            </Stack>

            {feedback && (
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>
                    {feedback.text}
                </Alert>
            )}

            {result && !result.exists && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                    action={
                        onNavigate ? (
                            <Button color="inherit" size="small" onClick={() => onNavigate('register')}>
                                Go to Register Program
                            </Button>
                        ) : undefined
                    }
                >
                    Program <strong>{result.programId}</strong> does not exist. Use Register Program to create it.
                </Alert>
            )}

            {result && result.exists && (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Box mb={2}>
                        <Typography variant="h5" mb={1}>
                            {result.programId}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Current program curators
                                </Typography>
                                {renderUserChips(result.curators)}
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Current team members
                                </Typography>
                                {renderUserChips(result.team)}
                            </Grid>
                        </Grid>
                    </Box>

                    <Box mb={1}>
                        <Typography variant="subtitle2" gutterBottom>
                            When saving
                        </Typography>
                        <RadioGroup row value={mode} onChange={(event) => setMode(event.target.value)}>
                            <FormControlLabel value="add" control={<Radio />} label="Add to existing users" />
                            <FormControlLabel value="replace" control={<Radio />} label="Replace existing users" />
                        </RadioGroup>
                    </Box>

                    <Grid container spacing={2} sx={{ maxWidth: 720 }}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Program curators"
                                placeholder="curator1@example.com, curator2@example.com …"
                                helperText={
                                    mode === 'add'
                                        ? 'These users are merged with the current curators.'
                                        : 'These users replace the current curators (leave blank to clear).'
                                }
                                value={curatorsInput}
                                onChange={(event) => setCuratorsInput(event.target.value)}
                                multiline
                                minRows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Team members"
                                placeholder="member1@example.com, member2@example.com …"
                                helperText={
                                    mode === 'add'
                                        ? 'These users are merged with the current team members.'
                                        : 'These users replace the current team members (leave blank to clear).'
                                }
                                value={teamInput}
                                onChange={(event) => setTeamInput(event.target.value)}
                                multiline
                                minRows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    startIcon={<IconDeviceFloppy size="1rem" />}
                                    disabled={busy}
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}

ManagePrograms.propTypes = {
    onNavigate: PropTypes.func,
    // When provided, restricts lookup to this set of program ids (e.g. a program
    // curator managing only programs they curate) and skips the list-all call.
    allowedPrograms: PropTypes.arrayOf(PropTypes.string),
    showHeading: PropTypes.bool
};

ManagePrograms.defaultProps = {
    showHeading: true
};

export default ManagePrograms;
