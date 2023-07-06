import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation } from 'store/api';

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();

    // Query 1: always have the federation sites and authorized programs query results available
    useEffect(() => {
        trackPromise(
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
        const url = `v2/authorized/donor_with_clinical_data?${new URLSearchParams(reader.query)}`;
        trackPromise(
            fetchFederation(url, 'katsu').then((data) => {
                writer((old) => ({ ...old, clinical: data }));
            }),
            'clinical'
        );
    }, [JSON.stringify(reader)]);

    // We don't really implement a graphical component
    return <></>;
}

export default SearchHandler;
