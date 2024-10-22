import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation, query } from 'store/api';

// NB: I assign to lastPromise a bunch to keep track of whether or not we need to chain promises together
// However, the linter really dislikes this, and assumes I want to put everything inside one useEffect?
/* eslint-disable react-hooks/exhaustive-deps */

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler({ setLoading }) {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();
    const summaryFetchAbort = useRef(new AbortController());
    const clinicalFetchAbort = useRef(new AbortController());

    // Query 1: always have the federation sites and authorized programs query results available
    let lastPromise = null;
    useEffect(() => {
        setLoading(true);
        lastPromise = trackPromise(
            fetchFederation('v3/discovery/sidebar_list', 'katsu')
                .then((data) => {
                    writer((old) => ({ ...old, sidebar: data }));
                })
                .then(() => fetchFederationStat('/patients_per_cohort'))
                .then((data) => {
                    writer((old) => ({ ...old, federation: data }));
                })
                .then(() => fetchFederation('v3/authorized/programs', 'katsu'))
                .then((data) => {
                    writer((old) => ({ ...old, programs: data }));
                })
                .then(() => fetch('/genomics/htsget/v1/genes'))
                .then((response) => (response.ok ? response.json() : console.log(response)))
                .then((data) => {
                    writer((old) => ({ ...old, genes: data?.results }));
                })
                .finally(() => setLoading(false)),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes (but not the page number), re-query the discovery stats
    const { ...queryNoPageSize } = reader.query || {};
    if ('page' in queryNoPageSize) {
        delete queryNoPageSize.page;
    }
    if ('page_size' in queryNoPageSize) {
        delete queryNoPageSize.page_size;
    }
    useEffect(() => {
        // First, we abort any currently-running search promises
        summaryFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        const CollateSummary = (data, statName) => {
            const summaryStat = {};
            data.forEach((site) => {
                const thisStat = site.results?.[statName];
                if (!thisStat) {
                    return;
                }

                Object.keys(thisStat).forEach((key) => {
                    if (key in summaryStat) {
                        summaryStat[key] += thisStat[key];
                    } else {
                        summaryStat[key] = thisStat[key];
                    }
                });
            });
            return summaryStat;
        };

        setLoading(true);
        const discoveryPromise = () =>
            query(queryNoPageSize, newAbort.signal, 'discovery/query')
                .then((data) => {
                    if (reader.filter?.node) {
                        data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                    }

                    const discoveryCounts = {
                        age_at_diagnosis: CollateSummary(data, 'age_at_diagnosis'),
                        treatment_type_count: CollateSummary(data, 'treatment_type_count'),
                        primary_site_count: CollateSummary(data, 'primary_site_count'),
                        patients_per_cohort: {}
                    };
                    data.forEach((site) => {
                        discoveryCounts.patients_per_cohort[site.location.name] = site.results?.patients_per_cohort;
                    });

                    writer((old) => ({ ...old, counts: discoveryCounts }));
                })
                .catch((error) => {
                    // Ignore abort errors
                    if (error !== 'New request started') {
                        console.log(error.message);
                    }
                });

        if (lastPromise === null) {
            lastPromise = discoveryPromise();
        } else {
            lastPromise.then(discoveryPromise);
        }

        summaryFetchAbort.current = newAbort;
    }, [JSON.stringify(queryNoPageSize), JSON.stringify(reader.donorLists), JSON.stringify(reader.genomic), JSON.stringify(reader.filter)]);

    // Query 2: when the search query changes, re-query the server
    useEffect(() => {
        // First, we abort any currently-running search promises
        clinicalFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        const donorQueryPromise = () =>
            query(reader.query, newAbort.signal)
                .then((data) => {
                    if (reader.filter?.node) {
                        data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                    }
                    // Reorder the data, and fill out the patients per cohort
                    const clinicalData = {};
                    data.forEach((site) => {
                        if ('results' in site) {
                            clinicalData[site.location.name] = site?.results;
                        }
                    });

                    const genomicData = data
                        .map((site) =>
                            site?.results?.genomic?.map((caseData) => {
                                caseData.location = site.location;
                                return caseData;
                            })
                        )
                        .flat(1);

                    writer((old) => ({ ...old, clinical: clinicalData, genomic: genomicData, loading: false }));
                })
                .catch((error) => {
                    // Ignore abort errors
                    if (error !== 'New request started') {
                        console.log(error.message);
                    }
                })
                .finally(() => setLoading(false));

        if (lastPromise === null) {
            lastPromise = donorQueryPromise();
        } else {
            lastPromise.then(donorQueryPromise);
        }

        clinicalFetchAbort.current = newAbort;
    }, [JSON.stringify(reader.query), JSON.stringify(reader.donorLists), JSON.stringify(reader.genomic), JSON.stringify(reader.filter)]);

    // Query 3: when the selected donor changes, re-query the server
    useEffect(() => {
        if (!reader.donorID || !reader.cohort) {
            return;
        }
        setLoading(true);

        const url = `v3/authorized/donor_with_clinical_data/program/${reader.cohort}/donor/${reader.donorID}`;
        trackPromise(
            fetchFederation(url, 'katsu')
                .then((data) => {
                    writer((old) => ({ ...old, donor: data }));
                })
                .finally(() => setLoading(false)),
            'donor'
        );
    }, [JSON.stringify(reader.donorID)]);

    // We don't really implement a graphical component
    // NB: This might be a good reason to have this be a function call instead of what it currently is.
    return null;
}
/* eslint-enable react-hooks/exhaustive-deps */

SearchHandler.propTypes = {
    setLoading: PropTypes.func
};

export default SearchHandler;
