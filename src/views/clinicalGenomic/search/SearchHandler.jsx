import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Snackbar from '@mui/material/Snackbar';
import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederation, query, fetchFederatedSubServices } from '../../../store/api';
import { isCensored } from '../../../utils/utils';

// NB: I assign to lastPromise a bunch to keep track of whether or not we need to chain promises together
// However, the linter really dislikes this, and assumes I want to put everything inside one useEffect?
/* eslint-disable react-hooks/exhaustive-deps */

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler({ setLoading }) {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();
    const summaryFetchAbort = useRef(new AbortController());
    const clinicalFetchAbort = useRef(new AbortController());

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarError, setSnackbarError] = useState("");

    const { ...fullQuery } = reader.query || {};
    // **Add genomic_data_types if it exists**
    if (reader.query?.genomic_data_types) {
        fullQuery.genomic_data_types = reader.query.genomic_data_types;
    }
    if (reader.filter?.node) {
        fullQuery.exclude_servers = reader.filter.node.join('|');
    }

    const openErrorPopup = (message) => {
        console.log(message);
        setSnackbarError(message);
        setSnackbarOpen(true);
    };

    // Query 1: always have the federation sites and authorized programs query results available
    let lastPromise = null;
    useEffect(() => {
        setLoading(true);
        lastPromise = trackPromise(
            fetchFederatedSubServices(`v3/discovery/sidebar_list`)
                .then((data) => writer((old) => ({ ...old, sidebar: data })))
                .then(() => fetchFederatedSubServices('v3/discovery/overview/patients_per_program'))
                .then((data) => writer((old) => ({ ...old, federation: data })))
                // NB: fetch instead of fetchWithRelogin because Katsu is misbehaving
                .then(() => fetchFederation('v3/authorized/programs', 'katsu', {}, fetch))
                .then((data) => writer((old) => ({ ...old, programs: data })))
                .then(() => fetch('/genomics/htsget/v1/genes'))
                .then((response) => (response.ok ? response.json() : console.log(response)))
                .then((data) => writer((old) => ({ ...old, genes: data?.results })))
                .catch((error) => openErrorPopup(error.message))
                .finally(() => setLoading(false)),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes (but not the page number), re-query the discovery stats
    useEffect(() => {
        // First, abort any currently-running search promises
        summaryFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        const CollateSummary = (data, statName) => {
            const summaryStat = {};
            data.forEach((site) => {
                const thisStat = site?.results?.[statName];
                if (!thisStat) return;

                Object.keys(thisStat).forEach((key) => {
                    if (key in summaryStat && !isCensored(summaryStat[key])) {
                        if (!isCensored(thisStat[key])) {
                            summaryStat[key] += thisStat[key];
                        }
                    } else {
                        summaryStat[key] = thisStat[key];
                    }
                });
            });
            return summaryStat;
        };

        // Prepare query excluding pagination
        const { ...discoveryQuery } = fullQuery || {};
        if ('page' in discoveryQuery) delete discoveryQuery.page;
        if ('page_size' in discoveryQuery) delete discoveryQuery.page_size;

        setLoading(true);
        const discoveryPromise = () =>
            query(discoveryQuery, newAbort.signal, 'discovery/query')
                .then((data) => {
                    if (reader.filter?.node) {
                        data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                    }

                    const discoveryCounts = {
                        age_at_diagnosis: CollateSummary(data, 'age_at_diagnosis'),
                        treatment_type_count: CollateSummary(data, 'treatment_type_count'),
                        primary_site_count: CollateSummary(data, 'primary_site_count'),
                        patients_per_program: {}
                    };
                    data.forEach((site) => {
                        discoveryCounts.patients_per_program[site.location.name] = site?.results?.patients_per_program;
                    });

                    writer((old) => ({ ...old, counts: discoveryCounts }));
                })
                .catch((error) => {
                    // Ignore abort errors
                    if (error !== 'New request started') {
                        openErrorPopup(error.message);
                    }
                });

        if (lastPromise === null) {
            lastPromise = discoveryPromise();
        } else {
            lastPromise.then(discoveryPromise);
        }

        summaryFetchAbort.current = newAbort;
    }, [reader.reqNum]);

    // Query 3: when the search query changes, re-query the server
    useEffect(() => {
        // First, we abort any currently-running search promises
        clinicalFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        const donorQueryPromise = () =>
            query(fullQuery, newAbort.signal)
                .then((data) => {
                    if (reader.filter?.node) {
                        data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                    }
                    // Reorder the data, and fill out the patients per program
                    const clinicalData = {};
                    data.forEach((site) => {
                        if ('results' in site) clinicalData[site.location.name] = site?.results;
                    });
                    const genomicData = data
                        .map((site) =>
                            site?.results?.genomic?.map((caseData) => {
                                caseData.location = site.location;
                                return caseData;
                            })
                        )
                        .flat(1);
                    // console.log('Genomic Data:', genomicData);
                    writer((old) => ({ ...old, clinical: clinicalData, genomic: genomicData, loading: false }));
                })
                .catch((error) => {
                    // Ignore abort errors
                    if (error !== 'New request started') {
                        openErrorPopup(error.message);
                    }
                })
                .finally(() => setLoading(false));

        if (lastPromise === null) {
            lastPromise = donorQueryPromise();
        } else {
            lastPromise.then(donorQueryPromise);
        }

        clinicalFetchAbort.current = newAbort;
    }, [reader.reqNum]);

    // Query 4: when the selected donor changes, re-query the server
    useEffect(() => {
        if (!reader.donorID || !reader.program) return;
        setLoading(true);

        const url = `v3/authorized/donor_with_clinical_data/program/${reader.program}/donor/${reader.donorID}`;
        trackPromise(
            fetchFederation(url, 'katsu')
                .then((data) => {
                    writer((old) => ({ ...old, donor: data }));
                })
                .finally(() => setLoading(false)),
            'donor'
        );
    }, [JSON.stringify(reader.donorID)]);

    // We don't really implement a graphical component unless there's been an error
    return <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        message={snackbarError}
        />;
}
/* eslint-enable react-hooks/exhaustive-deps */

SearchHandler.propTypes = {
    setLoading: PropTypes.func
};

export default SearchHandler;
