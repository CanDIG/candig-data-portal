import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation, searchVariant, searchVariantByGene } from 'store/api';

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

        // From the donorLists, AND/OR them as needed until we have just one final list of acceptable donors
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
                    // We need to do two things:
                    // 1. Push the raw data into the context
                    // 2. Go through the data and fill out our pseudo-discovery queries for data vis
                    const discoveryCounts = {
                        diagnosis_age_count: {},
                        treatment_type_count: {},
                        cancer_type_count: {},
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

                    // Add to a dictionary, or increment its value if it already exists
                    const addOrReplace = (dict, value) => {
                        if (value in dict) {
                            dict[value] += 1;
                        } else {
                            dict[value] = 1;
                        }
                    };

                    // Go through the donors we have, fill out our data visualization counts
                    const donorToDOB = {};
                    data.forEach((loc) => {
                        discoveryCounts.patients_per_cohort[loc.location.name] = {};
                        donorToDOB[loc.location.name] = {};
                        loc?.results?.results?.forEach((donor) => {
                            if (donor.date_of_birth) {
                                donorToDOB[loc.location.name][donor.submitter_donor_id] = donor.date_of_birth;
                            }
                            donor.primary_site.forEach((site) => addOrReplace(discoveryCounts.cancer_type_count, site));
                            addOrReplace(discoveryCounts.patients_per_cohort[loc.location.name], donor.program_id);
                        });
                    });

                    // Finally, to finish out our counts, we need to query the primary diagnoses
                    return fetchFederation('v2/authorized/treatments', 'katsu')
                        .then((treatments) => {
                            treatments.forEach((loc) => {
                                loc?.results?.results?.forEach((treatment) => {
                                    if (treatment.submitter_donor_id in donorToDOB[loc.location.name]) {
                                        treatment.treatment_type.forEach((treatmentType) => {
                                            addOrReplace(discoveryCounts.treatment_type_count, treatmentType);
                                        });
                                    }
                                });
                            });
                        })
                        .then(() => fetchFederation('v2/authorized/primary_diagnoses', 'katsu'))
                        .then((diagnoses) => {
                            diagnoses.forEach((loc) => {
                                loc?.results?.results?.forEach((diagnosis) => {
                                    if (diagnosis.submitter_donor_id in donorToDOB[loc.location.name] && diagnosis.date_of_diagnosis) {
                                        // Convert this to an age range
                                        const diagDate = diagnosis.date_of_diagnosis.split('-');
                                        const birthDate = donorToDOB[loc.location.name][diagnosis.submitter_donor_id].split('-');
                                        let ageAtDiagnosis = diagDate[0] - birthDate[0] + (diagDate[1] >= birthDate[1] ? 1 : 0);
                                        ageAtDiagnosis -= ageAtDiagnosis % 10;

                                        if (ageAtDiagnosis < 20) {
                                            ageAtDiagnosis = '0-19 Years';
                                        } else if (ageAtDiagnosis > 79) {
                                            ageAtDiagnosis = '80+ Years';
                                        } else {
                                            ageAtDiagnosis = `${ageAtDiagnosis}-${ageAtDiagnosis + 9} Years`;
                                        }
                                        addOrReplace(discoveryCounts.diagnosis_age_count, ageAtDiagnosis);

                                        delete donorToDOB[loc.location.name][diagnosis.submitter_donor_id];
                                    }
                                });
                            });
                            writer((old) => ({ ...old, clinical: data, counts: discoveryCounts }));
                        });
                }),
                'clinical'
            )
                .then(
                    // Grab the specimens from the backend
                    () => fetchFederation('v2/authorized/specimens', 'katsu')
                )
                .then((data) => {
                    // First, we need to parse out all of the specimens that exist inside of our finalList (if any)
                    const allowedSpecimens = [];
                    if (finalList) {
                        data.forEach((loc) => {
                            loc.results?.results?.forEach((specimen) => {
                                if (finalList.includes(specimen.submitter_donor_id)) {
                                    allowedSpecimens.push(specimen.submitter_specimen_id);
                                }
                            });
                        });
                    }
                    console.log(allowedSpecimens);

                    // We may need to query the HTSGet portion in order to do genomics search.
                    let htsgetPromise = null;
                    if (reader.genomic?.gene) {
                        htsgetPromise = searchVariantByGene(reader.genomic.gene);
                    } else if (reader.genomic?.referenceName) {
                        htsgetPromise = searchVariant(
                            reader.genomic?.referenceName,
                            reader.genomic?.start,
                            reader.genomic?.end,
                            reader.genomic?.assemblyId
                        );
                    }

                    // htsgetPromise = searchVariant('21', '5030000', '5030847', reader.genomic?.assemblyId);
                    if (htsgetPromise) {
                        htsgetPromise.then((htsgetData) => {
                            // Parse out the response from Beacon
                            const htsgetFilteredData = htsgetData
                                .map((loc) => {
                                    const handovers = loc.results?.beaconHandovers;
                                    return (
                                        loc.results.response?.map((response) =>
                                            response.caseLevelData
                                                .filter((caseData) => {
                                                    if (reader.query && Object.keys(reader.query).length > 0) {
                                                        return allowedSpecimens.includes(caseData.biosampleId);
                                                    }
                                                    return true;
                                                })
                                                .map((caseData) => {
                                                    caseData.beaconHandover = handovers[0];
                                                    caseData.location = loc.location;
                                                    caseData.position = response.variation.location.interval.start.value;
                                                    return caseData;
                                                })
                                        ) || []
                                    );
                                })
                                .flat(2);

                            writer((old) => ({ ...old, genomic: htsgetFilteredData }));
                        });
                    }
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
