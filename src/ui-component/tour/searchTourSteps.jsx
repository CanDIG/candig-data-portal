// Step definitions for the guided "CanDIG Clinical & Genomic Search" tour.
// Targets are matched by the `data-tour` attributes added to the search page
// (src/views/clinicalGenomic/clinicalGenomicSearch.jsx) and its sidebar
// (src/views/clinicalGenomic/widgets/sidebar.jsx).

// Genomic-filters documentation (opens in a new tab from the Genomic filters step).
const GENOMIC_DOCS_URL = 'https://candig.github.io/candigv2-docs/explore/clinical-genomic-search/#variant-search';

const searchTourSteps = [
    {
        target: 'body',
        placement: 'center',
        disableBeacon: true,
        title: "Welcome to CanDIG's Clinical & Genomic search page!",
        content:
            'This short tour shows you how to search across the federated network and how to read the results. Use Next and Back to move through it, or Skip to exit at any time.'
    },
    {
        target: '[data-tour="search-sidebar"]',
        placement: 'right',
        disableBeacon: true,
        title: 'Build your search here',
        content:
            'The left sidebar is where you build a query. Choose clinical and genomic filters, then run the search — results update in the main panel on the right after you hit the search button.'
    },
    {
        target: '[data-tour="search-tabs"]',
        placement: 'right',
        title: 'Filter categories',
        content: 'Switch between All, Clinical, and Genomic to focus the filters shown below.'
    },
    {
        target: '[data-tour="search-nodes"]',
        placement: 'right',
        title: 'Scope by node',
        content: 'Limit the search to specific federated sites (nodes). Leave everything selected to search the entire network.'
    },
    {
        target: '[data-tour="search-programs"]',
        placement: 'right',
        title: 'Scope by program',
        content:
            'Narrow results to particular programs. A locked padlock icon marks programs you are not authorized to see donor-level data for, whereas an unlocked padlock means you have full authorization to see donor-level metadata for all donors in the program.'
    },
    {
        target: '[data-tour="search-genomic"]',
        placement: 'right',
        title: 'Genomic filters',
        content: (
            <>
                Search by gene, or by a chromosome position range, and restrict to genomic data types (variants, transcriptomes, reads). You
                can filter by one gene or one position range at a time.{' '}
                <a href={GENOMIC_DOCS_URL} target="_blank" rel="noopener noreferrer">
                    Learn more about genomic filters
                </a>
                .
            </>
        )
    },
    {
        target: '[data-tour="search-run"]',
        placement: 'right',
        title: 'Run the search',
        content: 'When your filters are set, press Search to query the network. Use Reset to clear all filters and start over.'
    },
    {
        target: '[data-tour="results-counts"]',
        placement: 'top',
        title: 'Patient counts',
        content:
            'A summary of how many patients match your query, broken down by node across the federated network. If any count is below 10 donors, it will show as <10.'
    },
    {
        target: '[data-tour="results-expand-node"]',
        placement: 'left',
        title: 'Counts per program',
        // expandDemo: TourRunner expands this node while the step is shown, then
        // collapses it again when the tour moves on.
        expandDemo: true,
        content: 'Nodes hosting more than one program show an expand button. Expanding breaks that node’s donor counts down by program.'
    },
    {
        target: '[data-tour="results-visualization"]',
        placement: 'top',
        title: 'Data visualization',
        content:
            'Charts summarising the matching cohort — for example age distribution, treatment types, and primary sites. If any category has less than 10 donors, the chart is censored for that category.'
    },
    {
        target: '[data-tour="results-matching"]',
        placement: 'top',
        title: 'Matching patients',
        content: 'The list of patients matching the given query.'
    },
    {
        // Highlight the first data row of the Matching Patients table (a MUI
        // DataGrid renders each row as a .MuiDataGrid-row element).
        target: '[data-tour="results-matching"] .MuiDataGrid-row',
        placement: 'bottom',
        title: 'Opening a patient',
        content:
            'Click any patient row like this one to open their full clinical and genomic record in a new tab. A short tour of that page starts automatically the first time you open it.'
    }
];

export default searchTourSteps;
