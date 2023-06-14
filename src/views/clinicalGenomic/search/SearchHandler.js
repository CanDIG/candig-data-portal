import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation } from 'store/api';

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();

    // Query 1: always have the federation sites query results available
    useEffect(() => {
        trackPromise(
            fetchFederationStat("/patients_per_cohort").then((data) => {
                writer((old) => ({ ...old, federation: data }));
            }),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes, re-query the server
    useEffect(() => {
        let url = "v2/authorized/donor_with_clinical_data?" + new URLSearchParams(reader["query"]).toString();
        trackPromise(
            fetchFederation(url, "katsu").then((data) => {
                writer((old) => ({ ...old, clinical: data }));
            }),
            'clinical'
        );
    }, [JSON.stringify(reader)]);

    // We don't really implement a graphical component
    return <></>;
}

export default SearchHandler;
