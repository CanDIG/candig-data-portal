import { useEffect, useState } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation, query } from 'store/api';

// This will grab all of the results from a query, but continue to consume all "next" from the pagination until we are complete
// This defeats the purpose of pagination, and is frowned upon, but... deadlines
/* function ConsumeAllPages(url, resultConsumer, service = 'katsu') {
    const parsedData = {};
    const RecursiveQuery = (data, idx) => {
        let nextQuery = null;

        // Collect all donor IDs
        data.forEach((loc) => {
            if (!(loc.location.name in parsedData)) {
                parsedData[loc.location.name] = [];
            }

            if (loc.results?.next) {
                nextQuery = `${url}${url.includes('?') ? '&' : '?'}page=${idx + 1}`;
            }

            if (loc.results?.results) {
                parsedData[loc.location.name] = parsedData[loc.location.name].concat(loc.results.results.map(resultConsumer));
            }
        });

        if (nextQuery) {
            return fetchFederation(nextQuery, service).then((newData) => RecursiveQuery(newData, idx + 1));
        }

        return new Promise((resolve) => resolve(parsedData));
    };

    return fetchFederation(url, service).then((data) => RecursiveQuery(data, 1));
} */

// NB: I assign to lastPromise a bunch to keep track of whether or not we need to chain promises together
// However, the linter really dislikes this, and assumes I want to put everything inside one useEffect?
/* eslint-disable react-hooks/exhaustive-deps */

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();
    const [controller, _] = useState(new AbortController());

    // Query 1: always have the federation sites and authorized programs query results available
    let lastPromise = null;
    useEffect(() => {
        lastPromise = trackPromise(
            fetchFederation('v2/discovery/sidebar_list', 'katsu')
                .then((data) => {
                    writer((old) => ({ ...old, sidebar: data }));
                })
                .then(() => fetchFederationStat('/patients_per_cohort'))
                .then((data) => {
                    writer((old) => ({ ...old, federation: data }));
                })
                .then(() => fetchFederation('v2/authorized/programs', 'katsu'))
                .then((data) => {
                    writer((old) => ({ ...old, programs: data }));
                })
                .then(() => fetch('/genomics/htsget/v1/genes'))
                .then((response) => (response.ok ? response.json() : console.log(response)))
                .then((data) => {
                    writer((old) => ({ ...old, genes: data?.results }));
                }),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes, re-query the server
    useEffect(() => {
        // First, we abort any currently-running search promises
        // controller.abort();
        console.log('Query re-initiated');
        console.log(reader.query);

        const CollateSummary = (data, statName) => {
            const summaryStat = {};
            data.forEach((site) => {
                const thisStat = site.results?.summary?.[statName];
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

        const donorQueryPromise = () =>
            query(reader.query, controller.signal).then((data) => {
                if (reader.filter?.node) {
                    data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                }

                // We need to collate the discovery statistics from each site
                const discoveryCounts = {
                    diagnosis_age_count: CollateSummary(data, 'age_at_diagnosis'),
                    treatment_type_count: CollateSummary(data, 'treatment_type_count'),
                    cancer_type_count: CollateSummary(data, 'cancer_type_count'),
                    patients_per_cohort: {},

                    // Below is test data
                    full_clinical_data: {
                        BCGSC: {
                            POG: 30
                        },
                        UHN: {
                            POG: 14,
                            Inspire: 20,
                            Biocan: 20,
                            Biodiva: 10
                        },
                        C3G: {
                            MOCK: 30
                        }
                    },
                    full_genomic_data: {
                        BCGSC: {
                            POG: 10
                        },
                        UHN: {
                            POG: 4,
                            Inspire: 10,
                            Biocan: 12,
                            Biodiva: 12
                        },
                        C3G: {
                            MOCK: 3
                        }
                    }
                };

                // Reorder the data, and fill out the patients per cohort
                const clinicalData = {};
                data.forEach((site) => {
                    discoveryCounts.patients_per_cohort[site.location.name] = site.results?.summary?.patients_per_cohort;
                    clinicalData[site.location.name] = site?.results?.results;
                });

                const genomicData = data
                    .map((site) =>
                        site.results.genomic?.map((caseData) => {
                            caseData.location = site.location;
                            return caseData;
                        })
                    )
                    .flat(1);

                writer((old) => ({ ...old, clinical: clinicalData, counts: discoveryCounts, genomic: genomicData }));
            });

        if (lastPromise === null) {
            lastPromise = donorQueryPromise();
        } else {
            lastPromise.then(donorQueryPromise);
        }
    }, [JSON.stringify(reader.query), JSON.stringify(reader.donorLists), JSON.stringify(reader.genomic), JSON.stringify(reader.filter)]);

    // Query 3: when the selected donor changes, re-query the server
    useEffect(() => {
        if (!reader.donorID) {
            return;
        }

        const url = `v2/authorized/donor_with_clinical_data?submitter_donor_id=${reader.donorID}`;
        trackPromise(
            fetchFederation(url, 'katsu').then((data) => {
                writer((old) => ({ ...old, donor: data }));
            }),
            'donor'
        );
    }, [JSON.stringify(reader.donorID)]);

    // We don't really implement a graphical component
    // NB: This might be a good reason to have this be a function call instead of what it currently is.
    return <></>;
}
/* eslint-enable react-hooks/exhaustive-deps */

export default SearchHandler;
