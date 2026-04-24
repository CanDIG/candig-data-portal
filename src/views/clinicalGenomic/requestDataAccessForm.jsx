import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

import { Box, Button, CircularProgress, SvgIcon, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';

import { useSearchResultsReaderContext, useSearchResultsWriterContext } from './SearchResultsContext';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import MainCard from '../../ui-component/cards/MainCard';
import TextField from '../../ui-component/extended/TextField';
import config from '../../config';

const DATA_COHORT_ID = 'data_cohort_id';
const DATA_OWNER = 'data_owner';
const DATA_PROVIDER_NODE = 'data_provider_node';
const DATA_SHARING_AGREEMENT = 'data_sharing_agreement';
const DATE = 'date';
const FUNDERS = 'funders';
const RAW_TUMOUR_WGS = 'raw_tumour_wgs_requested';
const RAW_NORMAL_WGS = 'raw_normal_wgs_requested';
const RAW_TUMOUR_WTS = 'raw_tumour_wts_requested';
const ALIGNED_TUMOUR_WGS = 'aligned_tumour_wgs_requested';
const ALIGNED_NORMAL_WGS = 'aligned_normal_wgs_requested';
const ALIGNED_TUMOUR_WTS = 'aligned_tumour_wts_requested';
const INSTITUTIONAL_APPROVAL = 'institutional_approval';
const PI_EMAIL = 'pi_email';
const PI_INSTITUTION_NAME = 'pi_institution_name';
const PI_NAME = 'pi_name';
const PI_TITLE = 'pi_title';
const PI_MOHCCN_MEMBER = 'pi_mohccn_member';
const REB = 'reb';
const REQUEST_TYPE = 'request_type';
const SUBMITTER_EMAIL = 'requestor_email';
const SUBMITTER_INSTITUTION_NAME = 'requestor_institution_name';
const FILES_SECURE_ENVIRONMENT_NAME = 'files_secure_environment_name';
const SUBMITTER_NAME = 'requestor_name';
const SUBMITTER_ROLE = 'requestor_title';
const RESEARCH_TEAM_INFORMATION = 'research_team';
const SAME_AS_SUBMITTER = 'pi_same_as_requestor';
const OTHER_REQUESTED = 'other_requested';
const DOWNLOAD_REQUESTED = 'download_requested';
const FILES_SECURE = 'files_secure';

const MOH_CONTACT_EMAIL = config.supportEmail;
const PREFIX = 'RequestAccessForm';

const classes = {
    action: `${PREFIX}-action`,
    addButton: `${PREFIX}-add-button`,
    buttonIcon: `${PREFIX}-button-icon`,
    content: `${PREFIX}-content`,
    copyButton: `${PREFIX}-copy-button`,
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

    [`& .${classes.copyButton}`]: {
        textTransform: 'none',
        padding: '0 4px 1px 6px',
        marginLeft: '2px',
        alignItems: 'center',
        gap: '0.25rem'
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
    const context = useSearchResultsReaderContext();
    const writer = useSearchResultsWriterContext();

    const [data, setData] = useState({});
    const [showForm, setShowForm] = useState(true);
    const [isLoading, setIsLoading] = useState();
    const [tooltipText, setTooltipText] = useState('Click to copy');

    const submitterInformation = [
        {
            label: 'Full Name',
            field: SUBMITTER_NAME
        },
        {
            label: 'Role',
            field: SUBMITTER_ROLE
        },
        {
            label: 'Email',
            field: SUBMITTER_EMAIL,
            type: 'email'
        },
        {
            label: 'Institution',
            field: SUBMITTER_INSTITUTION_NAME
        }
    ];

    const principalInvestigatorInformation = [
        {
            label: 'Same as submitter information',
            field: SAME_AS_SUBMITTER,
            checkbox: true,
            required: false
        },
        {
            label: 'Full Name',
            field: PI_NAME,
            sublabel: '(non-confidential)',
            hidden: data[SAME_AS_SUBMITTER]
        },
        {
            label: 'Title',
            field: PI_TITLE,
            hidden: data[SAME_AS_SUBMITTER]
        },
        {
            label: 'Email',
            field: PI_EMAIL,
            type: 'email',
            hidden: data[SAME_AS_SUBMITTER]
        },
        {
            label: 'Institution',
            field: PI_INSTITUTION_NAME,
            subLabel: '(non-confidential)',
            hidden: data[SAME_AS_SUBMITTER]
        },
        {
            label: 'Is the PI an MOHCCN Individual Member?',
            field: PI_MOHCCN_MEMBER,
            checkbox: true,
            required: false
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
        },
        {
            label: 'If amendment or renewal, what is the existing Request Number?',
            field: 'existing_request_number',
            subLabel: '(e.g. MOHDA######)',
            multiline: true,
            hidden: ![
                'Amendment (to current approval)',
                'Renewal (2 years after last approval)'
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
            options: ['Yes (identify name and # of approval)', 'Pending', 'Not applicable']
        },
        {
            label: 'REB Institution Name',
            field: 'reb_institution_name',
            hidden: !['Yes (identify name and # of approval)', 'Pending'].includes(data[REB])
        },
        {
            label: 'Approval #',
            field: 'reb_approval_number',
            hidden: !['Yes (identify name and # of approval)', 'Pending'].includes(data[REB])
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
            required: false,
            sx: {
                mx: '0.5rem'
            }
        }
    ];

    const projectInformation2 = [
        {
            label: 'Nature of the Project',
            field: 'project_nature',
            options: ['Commercial use/IP development', 'Academic, non-commercial scientific research use']
        },
        {
            label: 'Data Sharing Agreement',
            field: DATA_SHARING_AGREEMENT,
            subLabel: '(where required by Data Owner/Data Access Committee)',
            options: ['Yes (identify name and # of agreement)', 'Pending negotiation/signature', 'Not applicable']
        },
        {
            label: 'Data Sharing Agreement Name',
            field: 'data_sharing_agreement_name',
            hidden: data[DATA_SHARING_AGREEMENT] !== 'Yes (identify name and # of agreement)'
        },
        {
            label: 'Data Sharing Agreement #',
            field: 'data_sharing_agreement_number',
            hidden: data[DATA_SHARING_AGREEMENT] !== 'Yes (identify name and # of agreement)'
        },
        {
            label: 'Describe the project objectives and alignment to MOHCCN.',
            field: 'project_objectives',
            subLabel: '(500 words max)',
            multiline: true,
            maxWords: 500
        },
        {
            label: 'Describe how the project will use MOHCCN data and provide justification for access to the specified data.',
            field: 'project_data_use',
            subLabel: '(500 words max)',
            multiline: true,
            maxWords: 500
        },
        {
            label: 'Are biospecimen samples part of this project and request? Are transfer agreements in place? Explain if this will be managed by rules set by the local institution or some other process.',
            field: 'biospecimen_use',
            subLabel: '(300 words max)',
            multiline: true,
            maxWords: 300
        },
        {
            label: 'Describe any possible reputational risks to MOHCCN or its members. Note that the possibility of these risks does not prevent approval. It is merely a way to provide those impacted with respectful notice.',
            field: 'project_risks',
            subLabel: '(300 words max)',
            multiline: true,
            maxWords: 300
        },
        {
            label: 'If software is being developed/validated, provide the type of license and list any third parties.',
            field: 'software_licenses',
            multiline: true
        }
    ];

    const dataCohortRequested = [
        {
            label: 'CanDIG Node',
            field: DATA_PROVIDER_NODE
        },
        {
            label: 'CanDIG Program_ID',
            field: DATA_COHORT_ID
        },
        {
            label: 'Describe the types of data requested (data must be available as described on the CanDIG Portal).',
            multiline: true,
            field: 'data_description'
        }
    ];

    const rawDataTypesRequested = [
        {
            label: 'Tumour WGS',
            field: RAW_TUMOUR_WGS,
            checkbox: true,
            required: false
        },
        {
            label: 'Normal WGS',
            field: RAW_NORMAL_WGS,
            checkbox: true,
            required: false
        },
        {
            label: 'Tumour WTS',
            field: RAW_TUMOUR_WTS,
            checkbox: true,
            required: false
        },
    ];

    const alignedDataTypesRequested = [
        {
            label: 'Tumour WGS',
            field: ALIGNED_TUMOUR_WGS,
            checkbox: true,
            required: false
        },
        {
            label: 'Normal WGS',
            field: ALIGNED_NORMAL_WGS,
            checkbox: true,
            required: false
        },
        {
            label: 'Tumour WTS',
            field: ALIGNED_TUMOUR_WTS,
            checkbox: true,
            required: false
        },
    ];

    const otherDataTypesRequested = [
        {
            label: 'Gene expression matrices, raw counts (csv or equivalent)',
            field: 'gene_expression_matrices_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Mutation calls (.vcf and .tbi)',
            field: 'mutation_calls_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Copy number variants',
            field: 'copy_number_variants_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Structural variants',
            field: 'structural_variants_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Fusion calls',
            field: 'fusion_calls_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Clinical Data',
            subLabel: '(includes all available data)',
            field: 'clinical_data_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'H&E Slide Images',
            subLabel: '(to be arranged with the contributing cohort(s))',
            field: 'he_slides_requested',
            checkbox: true,
            required: false
        },
        {
            label: 'Other',
            field: OTHER_REQUESTED,
            checkbox: true,
            required: false
        },
        {
            label: 'If other, describe the types of data (e.g., Gold Cohort preferred data types) and provide documentation confirming the availability of the data type for request.',
            field: 'other_description',
            required: false,
            multiline: true,
            hidden: data[OTHER_REQUESTED] !== true
        },
    ];

    const dataDownloadAndSecurity = [
        {
            label: 'Is download of data required?',
            field: DOWNLOAD_REQUESTED,
            checkbox: true,
            required: false
        },
        {
            label: 'If yes, list which data types.',
            field: 'download_request_types',
            required: false,
            multiline: true,
            hidden: data[DOWNLOAD_REQUESTED] !== true
        },
        {
            label: 'Will files be stored in a secure location that is approved by the Institution for purposes of genomic and clinical data? ',
            subLabel: 'For example, are you using a pre-vetted environment within your institution for this type of work? If yes, please confirm and name the environment so the DAC can create a master list.',
            field: FILES_SECURE,
            checkbox: true,
            required: false
        },
        {
            label: 'Environment name:',
            field: FILES_SECURE_ENVIRONMENT_NAME,
            required: false,
            options: ['HPC4Health private cloud (UHN)', 'Michael Smith Genome Science Centre – closed network (BCCancer ISO 27001 certified)', 'Secure Data 4 Health – secure cloud (McGill/Calcul Quebec).', 'Other'],
            hidden: data[FILES_SECURE] !== true
        },
    ];

    const otherSecurePractices = [
        {
            label: 'Organizational safeguards',
            subLabel: '(regular privacy and security training, access controls, logging and regular auditing of access and user activity, incident response)',
            field: 'organizational_safeguards',
            multiline: true,
            required: false
        },
        {
            label: 'Physical safeguards',
            subLabel: '(secure offices, labs, server rooms)',
            field: 'physical_safeguards',
            multiline: true,
            required: false
        },
        {
            label: 'Technical safeguards',
            subLabel: '(strong passwords, MFA for remote access, unique accounts, on-boarding/offboarding; closed network or firewall/intrusion detection, regular patching/malware updates)',
            field: 'technical_safeguards',
            multiline: true,
            required: false
        },
        {
            label: 'How will data storage and security be funded?',
            field: 'data_security_funding',
            subLabel: '(300 words max)',
            multiline: true,
            maxWords: 300
        },
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

    /* const allUniqueFields = [
        submitterInformation,
        principalInvestigatorInformation,
        requestType,
        researchTeamInformation,
        projectInformation1,
        funderInformation,
        projectInformation2,
        dataCohortRequested,
        rawDataTypesRequested,
        alignedDataTypesRequested,
        otherDataTypesRequested,
        dataDownloadAndSecurity,
        otherSecurePractices,
        acknowledgementAndSignature
    ].flat(); */

    // Clear the sidebar, if available
    const sidebarWriter = useSidebarWriterContext();
    useEffect(() => {
        sidebarWriter(null);
    }, [sidebarWriter]);

    useEffect(() => {
        const resetData = async () => {
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
            await fetch(`/candig-api/v1/whoami`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    console.log(`whoami could not determine logged in user: ${response}`);
                    throw new Error(`${response}`);
                })
                .then((response) => {
                    newData[SUBMITTER_EMAIL] = response?.key;
                })
                .catch((error) => {
                    console.log(`Whoami error: ${error}`);
                    return '';
                });

            // Get the data access committee for this data cohort, if applicable
            if (newData[DATA_COHORT_ID]) {
                await fetch(`/candig-api/v1/datasets/${newData[DATA_COHORT_ID]}/info`)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        }
                        console.log(`could not determine dataset information: ${response}`);
                        throw new Error(`${response}`);
                    })
                    .then((response) => {
                        newData[DATA_OWNER] = response?.dac_id;
                    })
                    .catch((error) => {
                        console.log(`Datasets error: ${error}`);
                        return '';
                    });
            }

            // Fill in user information from last form, if applicable
            newData = {
                ...context?.accessRequestFormData,
                ...newData
            };

            setData(newData);
        };

        resetData();

        // Scroll to top of page
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [showForm]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(MOH_CONTACT_EMAIL);
        setTooltipText('Copied');
    };

    const handleMouseEnter = () => {
        setTooltipText('Click to copy');
    };

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
            /* const alteredData = {};

            // Remove data from hidden fields
            allUniqueFields.forEach(({ hidden, field }) => {
                if (hidden && data[field]) {
                    alteredData[field] = null;
                }
            });

            // If PI info is same as requestor info, copy info over
            if (data[SAME_AS_SUBMITTER]) {
                alteredData[PI_NAME] = data[SUBMITTER_NAME];
                alteredData[PI_TITLE] = data[SUBMITTER_ROLE];
                alteredData[PI_EMAIL] = data[SUBMITTER_EMAIL];
                alteredData[PI_INSTITUTION_NAME] = data[SUBMITTER_INSTITUTION_NAME];
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
            }); */

            /* 
            TODO
            await fetch('', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer', // TODO
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: bodyData
            });
            */

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
                    ],
                    accessRequestFormData: {
                        ...Object.fromEntries(submitterInformation.map(({ field }) => [field, data[field]])),
                        ...Object.fromEntries(principalInvestigatorInformation.map(({ field }) => [field, data[field]]))
                    }
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
                        acc[curr.field] = '';
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
                    Data Access Request Form
                </Typography>
                <Typography>
                    Submit an access request through MoHCCN by clicking the Request
                    Access button next to the program of interest, which will create a Data Access Request form that can be downloaded and sent to the MOHCCN network Data Access Committee.
                </Typography>
                <Typography>
                    Submit general inquiries to the Marathon of Hope at:
                    <Tooltip title={tooltipText} placement="top">
                        <Button className={classes.copyButton} onClick={handleCopy} onMouseEnter={handleMouseEnter}>
                            {MOH_CONTACT_EMAIL}
                            <SvgIcon fontSize="small">
                                <ContentCopyRoundedIcon />
                            </SvgIcon>
                        </Button>
                    </Tooltip>
                </Typography>
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
                    Note: Fields in the form marked as non-confidential may be published or shared by the Marathon of Hope Cancer Care Network
                    (MoHCCN) or publicly, such as on the MOHCCN website.
                </Typography>
                <Typography variant="h2" className={classes.subtitle}>
                    Request Type
                </Typography>
                {mapToTextField(requestType)}
                <Typography variant="h2" className={classes.subtitle}>
                    Submitter Information
                </Typography>
                {mapToTextField(submitterInformation)}
                <Typography variant="h2" className={classes.subtitle}>
                    Principal Investigator (PI) Information
                </Typography>
                {mapToTextField(principalInvestigatorInformation)}
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
                    Genomic Data
                </Typography>
                <Typography component="span">
                    Raw Sequence Data (Lossless - FASTQ, BAM, or CRAM): all reads, including unmapped and duplicates:
                </Typography>
                {mapToTextField(rawDataTypesRequested)}
                <Typography component="span">
                    Aligned Sequence Data (BAM/CRAM): may exclude unmapped or alt/decoy contig alignments:
                </Typography>
                {mapToTextField(alignedDataTypesRequested)}
                <Typography component="span">
                    Other:
                </Typography>
                {mapToTextField(otherDataTypesRequested)}
                <Typography component="h2">
                    Data Download & Security
                </Typography>
                {mapToTextField(dataDownloadAndSecurity)}
                {(data[FILES_SECURE_ENVIRONMENT_NAME] === 'Other' ?
                    <>
                        <Typography component="h2">
                            If other location, please confirm that you follow best practices or standards for organizational, physical and technical safeguards. Please describe the safeguards you have in place.
                        </Typography>
                        {mapToTextField(otherSecurePractices)}
                    </>
                : <></>
                )}
                <Typography variant="h2" className={classes.subtitle}>
                    Acknowledgement and Signature
                </Typography>
                <Typography component="span">
                    By signing this form, you attest and confirm that:
                    <ul>
                        <li>You have read, understood and will comply with MOHCCN policies and protocols</li>
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
