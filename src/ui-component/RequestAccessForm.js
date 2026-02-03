import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

import TextField from 'ui-component/extended/TextField';

const PREFIX = 'RequestAccessForm';

const classes = {
    form: `${PREFIX}-form`
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.form}`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
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

    return (
        <StyledDialog open={open} onClose={handleClose}>
            <DialogTitle variant="h1">Request Access Form</DialogTitle>
            <DialogContent component="form" onSubmit={onSubmit} id="request-access-form" className={classes.form}>
                <Typography variant="h2">Requestor Information</Typography>
                {mapToTextField(requestorInformation)}
                <Typography variant="h2">Principal Investigator (PI) Information</Typography>
                {mapToTextField(principalInvestigatorInformation)}
                <Typography variant="h2">Request Type</Typography>
                {mapToTextField(requestType)}
                <Typography variant="h2">Research Team Information</Typography>
                {mapToTextField(researchTeamInformation)}
                <Typography variant="h2">Project Information</Typography>
                {mapToTextField(projectInformation)}
                <Typography variant="h2">Data Requested</Typography>
                <Typography variant="h3">Data Cohort Requested</Typography>
                {mapToTextField(dataCohortRequested)}
                {mapToTextField(dataRequested)}
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
