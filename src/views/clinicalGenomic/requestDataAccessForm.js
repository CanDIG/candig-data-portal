import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

import { Box, Button, CircularProgress, Typography } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';

import { useSearchResultsWriterContext } from 'views/clinicalGenomic/SearchResultsContext';
import MainCard from 'ui-component/cards/MainCard';
import TextField from 'ui-component/extended/TextField';

const DATA_COHORT_ID = 'data_cohort_id';
const DATA_PROVIDER_NODE = 'data_provider_node';
const DATE = 'date';
const FUNDERS = 'funders';
const INSTITUTIONAL_APPROVAL = 'institutional_approval';
const PI_EMAIL = 'pi_email';
const PI_INSTITUTION_NAME = 'pi_institution_name';
const PI_NAME = 'pi_name';
const PI_TITLE = 'pi_title';
const REB = 'reb';
const REQUEST_TYPE = 'request_type';
const REQUESTOR_EMAIL = 'requestor_email';
const REQUESTOR_INSTUTUTION_NAME = 'requestor_institution_name';
const REQUESTOR_INSTITUTION_TYPE = 'requestor_institution_type';
const REQUESTOR_NAME = 'requestor_name';
const REQUESTOR_TITLE = 'requestor_title';
const RESEARCH_TEAM_INFORMATION = 'research_team';
const SAME_AS_REQUESTOR = 'pi_same_as_requestor';

const PREFIX = 'RequestAccessForm';

const classes = {
    action: `${PREFIX}-action`,
    addButton: `${PREFIX}-add-button`,
    buttonIcon: `${PREFIX}-button-icon`,
    content: `${PREFIX}-content`,
    funderBlock: `${PREFIX}-funder-block`,
    grid: `${PREFIX}-grid`,
    loading: `${PREFIX}-loading`,
    teamBlock: `${PREFIX}-team-block`,
    removeButton: `${PREFIX}-remove-button`,
    subtitle: `${PREFIX}-subtitle`,
    title: `${PREFIX}-title`
};

const StyledMainCard = styled(MainCard)(({ theme }) => ({
    '& .MuiCardContent-root': {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '5rem 6rem 4rem'
    },

    [`& .${classes.action}`]: {
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between'
    },

    [`& .${classes.addButton}`]: {
        width: 'max-content',
        alignSelf: 'center',
        marginTop: '0.25rem'
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: '0.5rem',
        height: '1.25rem',
        width: '1.25rem'
    },

    [`& .${classes.content}`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },

    [`& .${classes.funderBlock}`]: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        alignItems: 'end',
        margin: '0 3rem'
    },

    [`& .${classes.grid}`]: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        rowGap: '1.5rem',
        columnGap: '1rem'
    },

    [`& .${classes.loading}`]: {
        color: theme.palette.primary.contrastText,
        position: 'absolute'
    },

    [`& .${classes.teamBlock}`]: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        rowGap: '0.5rem',
        columnGap: '1rem',
        margin: '0 3rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid grey'
    },

    [`& .${classes.removeButton}`]: {
        width: 'max-content',
        marginTop: '0.75rem',
        justifySelf: 'end',
        gridColumnStart: '2'
    },

    [`& .${classes.subtitle}`]: {
        paddingTop: '1rem'
    },

    [`& .${classes.title}`]: {
        paddingBottom: '1rem'
    }
}));

function RequestDataAccessForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const writer = useSearchResultsWriterContext();

    const [data, setData] = useState({});
    const [showForm, setShowForm] = useState(true);
    const [isLoading, setIsLoading] = useState();

    const requestorInformation = [
        {
            label: 'Full Name',
            field: REQUESTOR_NAME
        },
        {
            label: 'Title',
            field: REQUESTOR_TITLE
        },
        {
            label: 'Email',
            field: REQUESTOR_EMAIL,
            type: 'email'
        },
        {
            label: 'DHDP Member Institution Name',
            field: REQUESTOR_INSTUTUTION_NAME
        },
        {
            label: 'DHDP Member Institution Details',
            field: 'requestor_institution_details',
            multiline: true
        },
        {
            label: 'DHDP Member Institution Type',
            field: REQUESTOR_INSTITUTION_TYPE,
            options: [
                'Industry/private for-profit company',
                'Academic Institution',
                'Healthcare Institution',
                'Other not-for-profit company'
            ]
        },
        {
            label: 'Please describe',
            field: 'requestor_institution_type_description',
            hidden: data[REQUESTOR_INSTITUTION_TYPE] !== 'Other not-for-profit company'
        },
        {
            label: 'DHDP Member Institution Country',
            field: 'requestor_institution_country',
            options: ['Canada', 'Other']
        }
    ];

    const principalInvestigatorInformation = [
        {
            label: 'Same as requestor information',
            field: SAME_AS_REQUESTOR,
            checkbox: true,
            required: false
        },
        {
            label: 'Full Name',
            field: PI_NAME,
            sublabel: '(non-confidential)',
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'Title',
            field: PI_TITLE,
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'Email',
            field: PI_EMAIL,
            type: 'email',
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'DHDP Member Institution',
            field: PI_INSTITUTION_NAME,
            subLabel: '(non-confidential)',
            hidden: data[SAME_AS_REQUESTOR]
        }
    ];

    const requestType = [
        {
            label: 'Type of Request',
            field: REQUEST_TYPE,
            options: [
                'New (standard approval period of 2 years)',
                'Amendment (to current approval)',
                'Renewal (2 years after last approval)',
                'Resubmission (to previous decline)'
            ]
        },
        {
            label: 'If amendment, renewal, or resubmission, highlight changes.',
            field: 'request_type_highlight_changes',
            subLabel: '(500 words max)',
            multiline: true,
            maxWords: 500,
            hidden: ![
                'Amendment (to current approval)',
                'Renewal (2 years after last approval)',
                'Resubmission (to previous decline)'
            ].includes(data[REQUEST_TYPE])
        }
    ];

    const researchTeamInformation = [
        {
            label: 'Full Name',
            field: 'name'
        },
        {
            label: 'Email',
            field: 'email',
            type: 'email'
        },
        {
            label: 'Role',
            field: 'role'
        },
        {
            label: 'Institution',
            field: 'institution'
        }
    ];

    const projectInformation1 = [
        {
            label: 'Project Title',
            field: 'project_title',
            subLabel: '(non-confidential)'
        },
        {
            label: 'Lay Summary',
            field: 'lay_summary',
            subLabel: '(500 words max, non-confidential)',
            maxWords: 500,
            multiline: true
        },
        {
            label: 'Research Ethics Board (REB)',
            field: REB,
            options: ['Yes (identify name and # of approval)', 'Pending']
        },
        {
            label: 'REB Institution Name',
            field: 'reb_institution_name',
            hidden: data[REB] !== 'Yes (identify name and # of approval)'
        },
        {
            label: 'Approval #',
            field: 'reb_approval_number',
            hidden: data[REB] !== 'Yes (identify name and # of approval)'
        }
    ];

    const funderInformation = [
        {
            label: 'Funder Name',
            field: 'funder_name'
        },
        {
            label: 'For-Profit',
            field: 'for_profit',
            toggle: true,
            sx: {
                mx: '0.5rem'
            }
        }
    ];

    const projectInformation2 = [
        {
            label: 'DHDP Project #',
            field: 'project_number',
            subLabel: '(if funded by TFRI)',
            required: false
        },
        {
            label: 'Nature of the Project',
            field: 'project_nature',
            options: ['Commercial use/IP development', 'Academic, non-commercial scientific research use']
        },
        {
            label: 'Data Sharing Agreement',
            field: 'data_sharing_agreement',
            subLabel: '(where required by Data Owner/Data Access Committee)',
            options: ['Yes (identify name and # of agreement)', 'Pending negotiation/signature', 'Not applicable']
        },
        {
            label: 'Describe the project objectives and alignment to DHDP research and technology development aims.',
            field: 'project_objectives',
            subLabel: '(500 words max)',
            multiline: true,
            maxWords: 500
        },
        {
            label: 'Describe how the project will use data and provide justification for access to the specified data for (federated) analysis/learning.',
            field: 'project_data_use',
            subLabel: '(500 words max)',
            multiline: true,
            maxWords: 300
        },
        {
            label: 'Describe any potential legal, ethical or reputational risks to DHDP or its members. Note that the possibility of these risks does not prevent approval. It is merely a way to provide those impacted with respectful notice.',
            field: 'project_risks',
            subLabel: '(300 words max)',
            multiline: true,
            maxWords: 300
        }
    ];

    const dataCohortRequested = [
        {
            label: 'DHDP Data Provider Node',
            field: 'data_provider_node'
        },
        {
            label: 'DHDP Data Owner/Data Access Committee',
            field: 'data_owner'
        },
        {
            label: 'DHDP Cohort ID',
            field: 'data_cohort_id'
        },
        {
            label: 'Describe the types of data requested (data must be available as described on the DHDP Portal).',
            multiline: true,
            field: 'data_description'
        }
    ];

    const acknowledgementAndSignature = [
        {
            label: 'PI Signature',
            field: 'pi_signature',
            subLabel: '(Please type full name)'
        },
        {
            label: 'Date',
            field: DATE,
            required: false,
            disabled: true,
            key: 'date_1',
            id: 'date_1'
        },
        {
            label: 'An institutional representative has reviewed this form and approves of the provided information and data access request.',
            field: INSTITUTIONAL_APPROVAL,
            checkbox: true,
            required: false,
            sx: {
                gridColumnStart: 'span 2'
            }
        },
        {
            label: 'Institutional Signature',
            field: 'institutional_signature',
            subLabel: '(Please type full name)',
            required: false
        },
        {
            label: 'Date',
            field: DATE,
            required: false,
            disabled: true,
            key: 'date_2',
            id: 'date_2'
        }
    ];

    const allUniqueFields = [
        requestorInformation,
        principalInvestigatorInformation,
        requestType,
        projectInformation1,
        projectInformation2,
        dataCohortRequested,
        acknowledgementAndSignature
    ].flat();

    useEffect(() => {
        // Reset data when page loads
        const now = new Date();
        const date = `${now.getFullYear()}-${'0'.concat(now.getMonth() + 1).slice(-2)}-${'0'.concat(now.getDate()).slice(-2)}`;

        let newData = {
            // Prefill some data
            [DATA_PROVIDER_NODE]: location.state?.site,
            [DATA_COHORT_ID]: location.state?.programId,
            // Update date
            [DATE]: date,
            // Add one empty research team member to data form
            [RESEARCH_TEAM_INFORMATION]: [
                researchTeamInformation.reduce((acc, curr) => {
                    acc[curr.field] = '';
                    return acc;
                }, {})
            ],
            // Add one empty funder to data form
            [FUNDERS]: [
                funderInformation.reduce((acc, curr) => {
                    acc[curr.field] = '';
                    return acc;
                }, {})
            ]
        };

        // Grab the email for the logged in user
        fetch(`/query/whoami`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                console.log(`whoami could not determine logged in user: ${response}`);
                throw new Error(`${response}`);
            })
            .then((response) => {
                newData[REQUESTOR_EMAIL] = response?.key;
            })
            .catch((error) => {
                console.log(`Whoami error: ${error}`);
                return '';
            });

        // Fill in user information from last form, if applicable
        newData = {
            ...newData,
            ...Object.fromEntries(requestorInformation.map(({ field }) => [field, data[field]])),
            ...Object.fromEntries(principalInvestigatorInformation.map(({ field }) => [field, data[field]]))
        };

        setData(newData);

        // Scroll to top of page
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [showForm]);

    const handleChange = (key, value) => {
        setData((prevData) => ({
            ...prevData,
            [key]: value
        }));
    };

    const handleBack = () => {
        if (location.key !== 'default') {
            // Navigation history exists
            navigate(-1);
        } else {
            // No navigation history, go to clinical genomic search
            navigate('/clinicalGenomicSearch');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const alteredData = {};

            // Remove data from hidden fields
            allUniqueFields.forEach(({ hidden, field }) => {
                if (hidden && data[field]) {
                    alteredData[field] = null;
                }
            });

            // If PI info is same as requestor info, copy info over
            if (data[SAME_AS_REQUESTOR]) {
                alteredData[PI_NAME] = data[REQUESTOR_NAME];
                alteredData[PI_TITLE] = data[REQUESTOR_TITLE];
                alteredData[PI_EMAIL] = data[REQUESTOR_EMAIL];
                alteredData[PI_INSTITUTION_NAME] = data[REQUESTOR_INSTUTUTION_NAME];
            }

            const newData = { ...data, ...alteredData };

            // Send data
            const answers = {};
            let counter = 1;
            Object.entries(newData).forEach(([key, value]) => {
                answers[counter] = {
                    [key]: value
                };
                counter += 1;
            });

            const bodyData = JSON.stringify({
                form: {
                    answers
                },
                isAdfRequest: false, // TODO
                requestFieldValues: {}, // TODO
                requestParticipants: {}, // TODO
                requestTypeId: 0, // TODO
                serviceDeskId: 0 // TODO
            });

            await fetch('', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer', // TODO
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: bodyData
            });

            // Change "Request Access" button to "Access Requested"
            writer((old) => {
                const oldAccessRequested = old.accessRequested || [];
                return {
                    ...old,
                    accessRequested: [
                        ...oldAccessRequested,
                        {
                            site: data[DATA_PROVIDER_NODE],
                            programId: data[DATA_COHORT_ID]
                        }
                    ]
                };
            });

            // Show submission confirmation
            setShowForm(false);

            // Clear pre-filled fields
            navigate(location.pathname, { replace: true, state: {} });
        } catch (error) {
            console.log('Data access form submission error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const mapToTextField = (textFieldList) =>
        textFieldList.map(({ key, field, ...rest }) => (
            <TextField
                key={key || field}
                id={key || field}
                value={data[field]}
                onChange={(newValue) => handleChange(field, newValue)}
                {...rest}
            />
        ));

    const renderResearchTeamInformationBlock = (teamMember, index) => {
        const handleResearchTeamChange = (key, newValue) => {
            let alteredValue = data[RESEARCH_TEAM_INFORMATION];

            if (!alteredValue) {
                alteredValue = [];
            }

            while (alteredValue.length <= index) {
                alteredValue.push(
                    researchTeamInformation.reduce((acc, curr) => {
                        acc[curr.label] = '';
                        return acc;
                    }, {})
                );
            }

            alteredValue[index][key] = newValue;

            handleChange(RESEARCH_TEAM_INFORMATION, alteredValue);
        };

        const handleRemove = () => {
            const alteredValue = data[RESEARCH_TEAM_INFORMATION].filter((_, i) => i !== index);

            handleChange(RESEARCH_TEAM_INFORMATION, alteredValue);
        };

        return (
            <Box className={classes.teamBlock} key={`research-team-info-block-${index}`}>
                {researchTeamInformation.map(({ field, ...rest }) => (
                    <TextField
                        key={`${field}-${index}`}
                        id={`${field}-${index}`}
                        value={teamMember?.[field]}
                        onChange={(newValue) => handleResearchTeamChange(field, newValue)}
                        size="small"
                        {...rest}
                    />
                ))}
                <Button variant="outlined" className={classes.removeButton} onClick={handleRemove}>
                    <RemoveCircleOutlineRoundedIcon className={classes.buttonIcon} />
                    Remove Team Member
                </Button>
            </Box>
        );
    };

    const addResearchTeamInformationBlock = () => {
        let alteredValue = data[RESEARCH_TEAM_INFORMATION];

        if (!alteredValue) {
            alteredValue = [];
        }

        alteredValue.push(
            researchTeamInformation.reduce((acc, curr) => {
                acc[curr.field] = '';
                return acc;
            }, {})
        );

        handleChange(RESEARCH_TEAM_INFORMATION, alteredValue);
    };

    const renderFunderBlock = (funder, index) => {
        const handleFunderChange = (key, newValue) => {
            let alteredValue = data[FUNDERS];

            if (!alteredValue) {
                alteredValue = [];
            }

            while (alteredValue.length <= index) {
                alteredValue.push(
                    funderInformation.reduce((acc, curr) => {
                        acc[curr.label] = '';
                        return acc;
                    }, {})
                );
            }

            alteredValue[index][key] = newValue;

            handleChange(FUNDERS, alteredValue);
        };

        const handleRemove = () => {
            const alteredValue = data[FUNDERS].filter((_, i) => i !== index);

            handleChange(FUNDERS, alteredValue);
        };

        return (
            <Box className={classes.funderBlock} key={`funder-block-${index}`}>
                {funderInformation.map(({ field, ...rest }) => (
                    <TextField
                        key={`${field}-${index}`}
                        id={`${field}-${index}`}
                        value={funder?.[field]}
                        onChange={(newValue) => handleFunderChange(field, newValue)}
                        size="small"
                        sx={{ marginRight: 0 }}
                        {...rest}
                    />
                ))}
                <Button variant="outlined" sx={{ marginLeft: '0.75rem' }} onClick={handleRemove}>
                    <RemoveCircleOutlineRoundedIcon className={classes.buttonIcon} />
                    Remove Funder
                </Button>
            </Box>
        );
    };

    const addFunderBlock = () => {
        let alteredValue = data[FUNDERS];

        if (!alteredValue) {
            alteredValue = [];
        }

        alteredValue.push(
            funderInformation.reduce((acc, curr) => {
                acc[curr.field] = '';
                return acc;
            }, {})
        );

        handleChange(FUNDERS, alteredValue);
    };

    if (showForm) {
        return (
            <StyledMainCard component="form" onSubmit={handleSubmit}>
                <Button onClick={handleBack} sx={{ alignSelf: 'flex-start' }}>
                    <ChevronLeftRoundedIcon className={classes.buttonIcon} />
                    Back to Clinical & Genomic Search
                </Button>
                <Typography variant="h1" className={classes.title}>
                    DHDP Data Access Request Form
                </Typography>
                <Typography>
                    Submit an access request through the DHDP by navigating to a Cohort of interest on the DHDP Portal and click the Request
                    Access button, which will create a Request ticket on Jira (managed by TFRI).
                </Typography>
                <Typography>Submit general inquiries to DHDP at: dhdp@tfri.ca</Typography>
                <Typography>
                    Access requests will be directed to the data owners/Data Access Committees (DAC) at the relevant Data Provider
                    institutions responsible for and authorized to approve access to data for federated analysis/learning subject to
                    institutional policies.
                </Typography>
                <Typography>
                    An administrative review of the form should occur within 10 business days. Additional information may later be requested
                    by the Data Owner/DAC.
                </Typography>
                <Typography>
                    Note: Fields in the form marked as non-confidential may be published or shared by the DHDP/Terry Fox Research Institute
                    (TFRI) with other DHDP members or publicly, such as on the DHDP website.
                </Typography>
                <Typography variant="h2" className={classes.subtitle}>
                    Requestor Information
                </Typography>
                {mapToTextField(requestorInformation)}
                <Typography variant="h2" className={classes.subtitle}>
                    Principal Investigator (PI) Information
                </Typography>
                {mapToTextField(principalInvestigatorInformation)}
                <Typography variant="h2" className={classes.subtitle}>
                    Request Type
                </Typography>
                {mapToTextField(requestType)}
                <Typography variant="h2" className={classes.subtitle}>
                    Research Team Information
                </Typography>
                <Typography>
                    List all team members beyond the PI who will have access to the data here (where applicable). All individuals are under
                    the supervision and responsibility of the PI.
                </Typography>
                {data[RESEARCH_TEAM_INFORMATION] &&
                    data[RESEARCH_TEAM_INFORMATION].map((teamMember, index) => renderResearchTeamInformationBlock(teamMember, index))}
                <Button variant="outlined" className={classes.addButton} onClick={addResearchTeamInformationBlock}>
                    <AddCircleOutlineRoundedIcon className={classes.buttonIcon} />
                    Add team member
                </Button>
                <Typography variant="h2" className={classes.subtitle}>
                    Project Information
                </Typography>
                {mapToTextField(projectInformation1)}
                <Typography>Funders (Please indicate for-profit sponsors) *</Typography>
                {data[FUNDERS] && data[FUNDERS].map((funder, index) => renderFunderBlock(funder, index))}
                <Button variant="outlined" className={classes.addButton} onClick={addFunderBlock}>
                    <AddCircleOutlineRoundedIcon className={classes.buttonIcon} />
                    Add Funder
                </Button>
                {mapToTextField(projectInformation2)}
                <Typography variant="h2" className={classes.subtitle}>
                    Data Cohort Requested
                </Typography>
                {mapToTextField(dataCohortRequested)}
                <Typography variant="h2" className={classes.subtitle}>
                    Acknowledgement and Signature
                </Typography>
                <Typography component="span">
                    By signing this form, you attest and confirm that:
                    <ul>
                        <li>You have read, understood and will comply with DHDP policies and protocols</li>
                        <li>You are compliant with all institutional policies around privacy, confidentiality and security.</li>
                        <li>
                            The data is being accessed and used for the purposes of the specified federated analysis/learning project only.
                        </li>
                        <li>
                            Data will only be accessed by listed team members, who are all under the supervision and responsibility of the
                            PI.
                        </li>
                        <li>
                            The PI and research team will ensure the security of any user accounts, and will report any privacy or security
                            breach within 24 hours to TFRI and all relevant Data Providers,
                        </li>
                    </ul>
                </Typography>
                <Box className={classes.grid}>{mapToTextField(acknowledgementAndSignature)}</Box>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ marginTop: '2rem', marginBottom: '1rem', width: 'max-content', alignSelf: 'center' }}
                >
                    {isLoading && <CircularProgress className={classes.loading} size="1.5rem" />}
                    <Box component="span" style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
                        Submit Data Access Request Form
                    </Box>
                </Button>
            </StyledMainCard>
        );
    }

    // Show splash screen
    return (
        <StyledMainCard>
            <Typography variant="h1" sx={{ fontWeight: 400, alignSelf: 'center' }}>
                Form submitted for processing
            </Typography>
            {/* TODO: Display Jira request ID */}
            <Button
                onClick={() => setShowForm(true)}
                variant="outlined"
                sx={{ width: 'max-content', marginTop: '2rem ', alignSelf: 'center' }}
            >
                Submit another request
            </Button>
        </StyledMainCard>
    );
}

export default RequestDataAccessForm;
