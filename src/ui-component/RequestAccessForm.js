import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';

import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

import TextField from 'ui-component/extended/TextField';

const RESEARCH_TEAM_INFORMATION = 'Research Team Information';
const PREFIX = 'RequestAccessForm';

const classes = {
    form: `${PREFIX}-form`,
    bold: `${PREFIX}-bold`,
    block: `${PREFIX}-block`,
    addButton: `${PREFIX}-add-button`,
    removeButton: `${PREFIX}-remove-button`
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.form}`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },

    [`& .${classes.bold}`]: {
        fontWeight: 700
    },

    [`& .${classes.block}`]: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        rowGap: '0.5rem',
        columnGap: '1rem',
        padding: '1rem 1rem 1.25rem',
        borderBottom: '1px solid grey'
    },

    [`& .${classes.addButton}`]: {
        width: 'max-content',
        alignSelf: 'center'
    },

    [`& .${classes.removeButton}`]: {
        width: 'max-content',
        marginTop: '0.75rem'
    }
}));

const requestorInformation = [
    {
        label: 'Full Name'
    },
    {
        label: 'Title'
    },
    {
        label: 'Email'
    },
    {
        label: 'DHDP Member Institution Name and Details',
        multiline: true
    },
    {
        label: 'DHDP Member Institution Type',
        options: [
            'Industry / private for-profit company',
            'Academic Institution',
            'Healthcare Institution',
            'Other not-for-profit company (please describe' // TODO
        ]
    },
    {
        label: 'DHDP Member Institution Country',
        options: ['Canada', 'Other']
    }
];

const principalInvestigatorInformation = [
    {
        label: 'Full Name',
        sublabel: '(non-confidential)'
    },
    {
        label: 'Title'
    },
    {
        label: 'Email'
    },
    {
        label: 'DHDP Member Institution (non-confidential)'
    }
];

const requestType = [
    {
        label: 'Type of Request',
        options: [
            'New (standard approval period of 2 years)',
            'Amendment (to current approval)',
            'Renewal (2 years after last approval)',
            'Resubmission (to previous decline)'
        ]
    },
    {
        label: 'If amendment, renewal or resubmission, highlight changes.',
        subLabel: '(500 words max)',
        multiline: true
    }
];

const researchTeamInformation = [
    {
        label: 'Full Name'
    },
    {
        label: 'Email'
    },
    {
        label: 'Role'
    },
    {
        label: 'Institution'
    }
];

const projectInformation = [
    {
        label: 'Project Title',
        subLabel: '(non-confidential)'
    },
    {
        label: 'Lay Summary',
        subLabel: '(500 words max, non-confidential)',
        multiline: true
    },
    {
        label: 'Research Ethics Board (REB)',
        options: ['Yes (identify name and # of approval)', 'Pending']
    },
    {
        label: 'REB Institution Name',
        subLabel: '(where applicable)'
    },
    {
        label: 'Approval # (if applicable)'
    },
    {
        label: 'Funders',
        subLabel: '(mark with * if a for-profit sponsor)'
    },
    {
        label: 'DHDP Project #',
        subLabel: '(if funded by TFRI)'
    },
    {
        label: 'Nature of the Project',
        options: ['Commercial use / IP development', 'Academic, non-commercial scientific research use']
    },
    {
        label: 'Data Sharing Agreement',
        subLabel: '(where required by Data Owner / Data Access Committee)',
        options: ['Yes (identify name and # of agreement)', 'Pending negotiation / signature', 'Not applicable']
    },
    {
        label: 'Describe the project objectives and alignment to DHDP research and technology   development aims.',
        subLabel: '(500 words max)',
        multiline: true
    },
    {
        label: 'Describe how the project will use data and provide justification for access to the   specified data for (federated) analysis / learning.',
        subLabel: '(500 words max)'
    },
    {
        label: 'Describe any potential legal, ethical or reputational risks to DHDP or its members.   Note that the possibility of these risks does not prevent approval. It is merely a   way to provide those impacted with respectful notice.',
        subLabel: '(300 words max)'
    }
];

const dataCohortRequested = [
    {
        label: 'DHDP Data Provider Node'
    },
    {
        label: 'DHDP Data Owner / Data Access Committee'
    },
    {
        label: 'DHDP Cohort ID'
    }
];

const dataRequested = [
    {
        label: 'Describe the types of data requested (data must be available as described on the   DHDP Portal).',
        multiline: true
    }
];

function RequestAccessForm({ open, setOpen, onSubmit, data, setData }) {
    useEffect(() => {
        if (!data[RESEARCH_TEAM_INFORMATION]) {
            setData((prevData) => ({
                ...prevData,
                [RESEARCH_TEAM_INFORMATION]: [
                    researchTeamInformation.reduce((acc, curr) => {
                        acc[curr.label] = '';
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

    const mapToTextField = (textFieldList) =>
        textFieldList.map((entry) => (
            <TextField
                {...entry}
                key={entry.label}
                value={data[entry.label]}
                onChange={(newValue) => handleChange(entry.label, newValue)}
            />
        ));

    const getResearchTeamInformationBlock = (teamMember, index) => {
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
            <Box className={classes.block} key={`research-team-info-block-${index}`}>
                {researchTeamInformation.map((entry) => (
                    <TextField
                        {...entry}
                        key={`${entry.label}-${index}`}
                        value={teamMember?.[entry.label]}
                        onChange={(newValue) => handleResearchTeamChange(entry.label, newValue)}
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
                acc[curr.label] = '';
                return acc;
            }, {})
        );

        handleChange(RESEARCH_TEAM_INFORMATION, alteredValue);
    };

    return (
        <StyledDialog open={open} onClose={handleClose}>
            <DialogTitle variant="h1">DHDP Data Access Request Form</DialogTitle>
            <DialogContent component="form" onSubmit={onSubmit} id="request-access-form" className={classes.form}>
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
                <Typography variant="h2">{RESEARCH_TEAM_INFORMATION}</Typography>
                <Typography>
                    List all team members beyond the PI who will have access to the data here (where applicable). All individuals are under
                    the supervision and responsibility of the PI.
                </Typography>
                {data[RESEARCH_TEAM_INFORMATION] &&
                    data[RESEARCH_TEAM_INFORMATION].map((teamMember, index) => getResearchTeamInformationBlock(teamMember, index))}
                <Button variant="outlined" className={classes.addButton} onClick={addResearchTeamInformationBlock}>
                    Add team member
                </Button>
                <Typography variant="h2">Project Information</Typography>
                {mapToTextField(projectInformation)}
                <Typography variant="h2">Data Requested</Typography>
                <Typography variant="h3">Data Cohort Requested</Typography>
                {mapToTextField(dataCohortRequested)}
                {mapToTextField(dataRequested)}
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
            </DialogContent>
            <DialogActions>
                <Button type="submit" form="request-access-form" variant="contained">
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
