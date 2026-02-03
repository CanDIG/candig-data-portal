import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Typography } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import TextField from 'ui-component/extended/TextField';

const DATE = 'date';
const FUNDERS = 'funders';
const INSTITUTIONAL_APPROVAL = 'institutional_approval';
const REB = 'reb';
const REQUEST_TYPE = 'request_type';
const REQUESTOR_INSTITUTION_TYPE = 'requestor_institution_type';
const RESEARCH_TEAM_INFORMATION = 'research_team';
const SAME_AS_REQUESTOR = 'pi_same_as_requestor';

const PREFIX = 'RequestAccessForm';

const classes = {
    action: `${PREFIX}-action`,
    addButton: `${PREFIX}-add-button`,
    bold: `${PREFIX}-bold`,
    content: `${PREFIX}-content`,
    funderBlock: `${PREFIX}-funder-block`,
    grid: `${PREFIX}-grid`,
    teamBlock: `${PREFIX}-team-block`,
    removeButton: `${PREFIX}-remove-button`,
    title: `${PREFIX}-title`
};

const StyledDialog = styled(Dialog)(() => ({
    [`& .${classes.action}`]: {
        padding: '1.5rem 2.5rem 1.5rem 1.5rem',
        justifyContent: 'space-between'
    },

    [`& .${classes.addButton}`]: {
        width: 'max-content',
        alignSelf: 'center',
        marginTop: '0.25rem'
    },

    [`& .${classes.bold}`]: {
        fontWeight: 700
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

    [`& .${classes.title}`]: {
        padding: '2rem 2rem 1rem'
    }
}));

function RequestAccessForm({ open, setOpen, onSubmit, data, setData }) {
    const requestorInformation = [
        {
            label: 'Full Name',
            field: 'requestor_name'
        },
        {
            label: 'Title',
            field: 'requestor_title'
        },
        {
            label: 'Email',
            field: 'requestor_email',
            type: 'email'
        },
        {
            label: 'DHDP Member Institution Name',
            field: 'requestor_institution_name'
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
            field: 'pi_name',
            sublabel: '(non-confidential)',
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'Title',
            field: 'pi_title',
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'Email',
            field: 'pi_email',
            type: 'email',
            hidden: data[SAME_AS_REQUESTOR]
        },
        {
            label: 'DHDP Member Institution',
            field: 'pi_institution_name',
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
            label: 'Describe the project objectives and alignment to DHDP research and technology   development aims.',
            field: 'project_objectives',
            subLabel: '(2500 characters max)',
            multiline: true,
            maxLength: 2500
        },
        {
            label: 'Describe how the project will use data and provide justification for access to the   specified data for (federated) analysis/learning.',
            field: 'project_data_use',
            subLabel: '(2500 characters max)',
            multiline: true,
            maxLength: 1500
        },
        {
            label: 'Describe any potential legal, ethical or reputational risks to DHDP or its members.   Note that the possibility of these risks does not prevent approval. It is merely a way to provide those impacted with respectful notice.',
            field: 'project_risks',
            subLabel: '(1500 characters max)',
            multiline: true,
            maxLength: 1500
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
            label: 'Describe the types of data requested (data must be available as described on the   DHDP Portal).',
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
            sx: {
                gridColumnStart: 'span 2'
            }
        },
        {
            label: 'Institutional Signature',
            field: 'institutional_signature',
            subLabel: '(Please type full name)'
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
        // Update date whenever dialog is opened
        const now = new Date();
        const date = `${now.getFullYear()}-${'0'.concat(now.getMonth() + 1).slice(-2)}-${'0'.concat(now.getDate()).slice(-2)}`;

        setData((prevData) => ({
            ...prevData,
            [DATE]: date
        }));
    }, [open]);

    useEffect(() => {
        // Add one empty research team member to data form
        if (!data[RESEARCH_TEAM_INFORMATION]) {
            setData((prevData) => ({
                ...prevData,
                [RESEARCH_TEAM_INFORMATION]: [
                    researchTeamInformation.reduce((acc, curr) => {
                        acc[curr.field] = '';
                        return acc;
                    }, {})
                ]
            }));
        }

        // Add one empty funder to data form
        if (!data[FUNDERS]) {
            setData((prevData) => ({
                ...prevData,
                [FUNDERS]: [
                    funderInformation.reduce((acc, curr) => {
                        acc[curr.field] = '';
                        return acc;
                    }, {})
                ]
            }));
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (key, value) => {
        setData((prevData) => ({
            ...prevData,
            [key]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const alteredData = {};

        // Remove data from hidden fields
        allUniqueFields.forEach(({ hidden, field }) => {
            if (hidden && data[field]) {
                alteredData[field] = null;
            }
        });

        setData((prevData) => ({ ...prevData, ...alteredData }));
        onSubmit();
    };

    const mapToTextField = (textFieldList) =>
        textFieldList.map(({ key, field, maxLength, ...rest }) => (
            <TextField
                key={key || field}
                id={key || field}
                value={data[field]}
                onChange={(newValue) => {
                    if (maxLength && newValue.length > maxLength) {
                        return;
                    }
                    handleChange(field, newValue);
                }}
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
                <Tooltip title="Remove Funder">
                    <IconButton onClick={handleRemove}>
                        <RemoveCircleOutlineIcon />
                    </IconButton>
                </Tooltip>
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

    return (
        <StyledDialog open={open} onClose={handleClose} component="form" onSubmit={handleSubmit} maxWidth="md">
            <DialogTitle variant="h1" className={classes.title}>
                DHDP Data Access Request Form
            </DialogTitle>
            <DialogContent className={classes.content} dividers>
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
                <Typography className={classes.bold}>All fields are mandatory.</Typography>
                <Typography variant="h2">Requestor Information</Typography>
                {mapToTextField(requestorInformation)}
                <Typography variant="h2">Principal Investigator (PI) Information</Typography>
                {mapToTextField(principalInvestigatorInformation)}
                <Typography variant="h2">Request Type</Typography>
                {mapToTextField(requestType)}
                <Typography variant="h2">Research Team Information</Typography>
                <Typography>
                    List all team members beyond the PI who will have access to the data here (where applicable). All individuals are under
                    the supervision and responsibility of the PI.
                </Typography>
                {data[RESEARCH_TEAM_INFORMATION] &&
                    data[RESEARCH_TEAM_INFORMATION].map((teamMember, index) => renderResearchTeamInformationBlock(teamMember, index))}
                <Button variant="outlined" className={classes.addButton} onClick={addResearchTeamInformationBlock}>
                    Add team member
                </Button>
                <Typography variant="h2">Project Information</Typography>
                {mapToTextField(projectInformation1)}
                <Typography>Funders (Please indicate for-profit sponsors) *</Typography>
                {data[FUNDERS] && data[FUNDERS].map((funder, index) => renderFunderBlock(funder, index))}
                <Button variant="outlined" className={classes.addButton} onClick={addFunderBlock}>
                    Add Funder
                </Button>
                {mapToTextField(projectInformation2)}
                <Typography variant="h2">Data Cohort Requested</Typography>
                {mapToTextField(dataCohortRequested)}
                <Typography variant="h2">Acknowledgement and Signature</Typography>
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
            </DialogContent>
            <DialogActions className={classes.action}>
                <Button variant="outlined" onClick={handleClose}>
                    Close
                </Button>
                <Button type="submit" variant="contained">
                    Submit
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}

RequestAccessForm.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
    setData: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default RequestAccessForm;
