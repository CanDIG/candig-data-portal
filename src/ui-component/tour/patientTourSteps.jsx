// Step definitions for the guided tour of the patient information page.
// Targets are matched by the `data-tour` attributes in
// src/views/clinicalGenomic/clinicalPatientView.jsx. This tour runs in place on
// the patient page (it sets no endRoute), so finishing leaves the user there.

const patientTourSteps = [
    {
        target: 'body',
        placement: 'center',
        disableBeacon: true,
        title: 'The patient information page',
        content:
            'This page shows a single patient’s full record. Here’s a quick tour of what you’ll find. Use Next and Back to move through it, or Skip to exit.'
    },
    {
        target: '[data-tour="patient-info"]',
        placement: 'bottom',
        disableBeacon: true,
        title: 'Donor summary',
        content: 'Key details about the donor — program, sex at birth, age at first diagnosis, and other top-level attributes.'
    },
    {
        target: '[data-tour="patient-sidebar"]',
        placement: 'right',
        title: 'Browse clinical categories',
        content:
            'Use these folders to move between clinical categories — primary diagnoses, treatments, specimens, follow-ups and more. Selecting one shows its details in the table.'
    },
    {
        target: '[data-tour="patient-donor-lookup"]',
        placement: 'right',
        title: 'Jump to another donor',
        content:
            'Look up a specific donor without going back to search. Pick a node and program you have access to, then choose a donor ID from the list — only donors you’re authorized to view appear — to open that patient’s page.'
    },
    {
        target: '[data-tour="patient-clinical"]',
        placement: 'top',
        title: 'Clinical data table',
        content: 'The records for the selected category, one row per entry.'
    },
    {
        target: '[data-tour="patient-timeline"]',
        placement: 'top',
        title: 'Patient timeline',
        content:
            'A timeline of the donor’s diagnosis, treatments and follow-ups. The timeline can be zoomed in and out to focus on different time periods. The list of treatments can be expanded and clicking on an event will show its details in the table above.'
    },
    {
        target: '[data-tour="patient-genomic"]',
        placement: 'top',
        title: 'Genomic data',
        content:
            'Any genomic samples associated with this donor — sample and experiment IDs, variant counts, and links to the associated files.'
    }
];

export default patientTourSteps;
