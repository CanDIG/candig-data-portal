import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation } from 'store/api';

// This will grab all of the results from a query, but continue to consume all "next" from the pagination until we are complete
// This defeats the purpose of pagination, and is frowned upon, but... deadlines
function ConsumeAllDonors(url, service = 'katsu') {
    let donors = [];
    const RecursiveQuery = (data) => {
        let nextQuery = null;

        // Collect all donor IDs
        data.forEach((loc) => {
            if (loc.next) {
                nextQuery = loc.next;
            }

            if (loc.results) {
                donors = donors.concat(loc.results.map((donor) => donor.submitter_donor_id));
            }
        });

        if (nextQuery) {
            return fetchFederation(nextQuery, service).then(RecursiveQuery);
        }

        return new Promise((resolve) => resolve(donors));
    };

    return fetchFederation(url, service).then(RecursiveQuery);
}

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();

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
                }),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes, re-query the server
    useEffect(() => {
        const searchParams = new URLSearchParams();
        // Parse out search parameters according to what they are:
        if (reader.query) {
            Object.keys(reader.query).forEach((key) => {
                searchParams.append(key, Array.isArray(reader.query[key]) ? reader.query[key].join(',') : reader.query[key]);
            });
        }
        const url = `v2/authorized/donors?${searchParams}`;

        const donorQueryPromise = () =>
            trackPromise(
                fetchFederation(url, 'katsu').then((data) => {
                    writer((old) => ({ ...old, clinical: data }));
                    return data;
                }),
                'clinical'
            ).then((data) => {
                // Recursively query the genomics data until we have all the data we need
                // NB: This needs to be moved to the backend somewhere. The UI should not be responsible for this.
                const CLINICAL_PAGE_SIZE = 10;
                

                console.log(data);
            });

        if (lastPromise === null) {
            lastPromise = donorQueryPromise();
        } else {
            lastPromise.then(donorQueryPromise);
        }
    }, [JSON.stringify(reader.query)]);

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
    return <></>;
}

export default SearchHandler;
