import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from "../SearchResultsContext";
import { fetchFederationStat, fetchFederationClinicalData } from 'store/api';

// This handles transforming queries in the SearchResultsContext to actual search queries
function SearchHandler() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();

    // Query 1: always have the federation sites query results available
    useEffect(() => {
        trackPromise(
            fetchFederationStat().then((data) => {
                writer((old) => ({...old, federation: data}));
            }),
            'federation'
        );
    }, []);

    // Query 2: when the search query changes, re-query the server
    useEffect(() => {
        trackPromise(
            fetchFederationClinicalData().then((data) => {
                writer((old) => ({...old, mcode: data}));
            }),
            'clinical'
        );
    }, [JSON.stringify(reader)])

    // We don't really implement a graphical component
    return <></>;
}

export default SearchHandler;