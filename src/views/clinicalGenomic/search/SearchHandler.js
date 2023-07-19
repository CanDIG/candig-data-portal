import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation, searchVariant } from 'store/api';

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
        const searchParams = new URLSearchParams();
        /*
        // Parse out search parameters according to what they are:
        if (reader.query) {
            Object.keys(reader.query).forEach((key) => {
                searchParams.append(key, Array.isArray(reader.query[key]) ? reader.query[key].join(',') : reader.query[key]);
            });
        } */

        // Queries now return lists of donors(??? Why is it like this?) so we need to AND/OR them as needed
        if (reader.query) {
            Object.keys(reader.query).forEach((key) => {
                searchParams.append(key, Array.isArray(reader.query[key]) ? reader.query[key].join(',') : reader.query[key]);
            });
        }

        let finalList = null;
        if (reader.donorLists && Object.keys(reader.donorLists).length > 0) {
            const allLists = Object.keys(reader.donorLists)?.map((key) =>
                // Lists from the same queries are OR'd together
                [...new Set(Object.values(reader?.donorLists[key])?.flat(1))]
            );

            // Lists from different queries are AND'd together
            const toQuery = allLists[0];
            finalList = toQuery.filter((donor) => allLists.every((list) => list.includes(donor)));

            // TODO: Figure out pagination (again)
            searchParams.append('donors', finalList.join(','));
        }

        const url = `v2/authorized/donors?${searchParams}`;

        const donorQueryPromise = () =>
            trackPromise(
                fetchFederation(url, 'katsu').then((data) => {
                    writer((old) => ({ ...old, clinical: data }));
                    return data;
                }),
                'clinical'
            )
                .then(() =>
                    // Grab the specimens from the backend
                    fetchFederation('v2/authorized/specimens', 'katsu')
                )
                .then((data) => {
                    // We may need to query the HTSGet portion in order to do genomics search.
                    /* searchVariant(
                        reader.genomic?.referenceName,
                        reader.genomic?.start,
                        reader.genomic?.end,
                        reader.genomic?.assemblyId
                    ).then((htsgetData) => { */
                    searchVariant('21', '5030000', '5030847', reader.genomic?.assemblyId).then((htsgetData) => {
                        // Parse out the response from Beacon
                        const htsgetFilteredData = htsgetData
                            .map((loc) => {
                                const handovers = loc.results?.beaconHandovers;
                                return loc.results.response.map((response, index) =>
                                    response.caseLevelData
                                        .filter((caseData) => {
                                            if (reader.query && Object.keys(reader.query).length > 0) {
                                                return finalList !== null && finalList.contains(caseData.biosampleId);
                                            }
                                            return true;
                                        })
                                        .map((caseData) => {
                                            caseData.beaconHandover = handovers[0];
                                            caseData.location = loc.location;
                                            console.log(caseData.location);
                                            if (!loc.location) {
                                                console.log(`Weird scenario with no location: ${loc}`);
                                            }
                                            caseData.position = response.variation.location.interval.start.value;
                                            return caseData;
                                        })
                                );
                            })
                            .flat(2);

                        writer((old) => ({ ...old, genomic: htsgetFilteredData }));
                    });
                });

        if (lastPromise === null) {
            lastPromise = donorQueryPromise();
        } else {
            lastPromise.then(donorQueryPromise);
        }
    }, [JSON.stringify(reader.query), JSON.stringify(reader.donorLists), JSON.stringify(reader.genomic)]);

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

export default SearchHandler;
