import { useEffect } from 'react';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { fetchFederationStat, fetchFederation, searchVariant, searchVariantByGene } from 'store/api';

// This will grab all of the results from a query, but continue to consume all "next" from the pagination until we are complete
// This defeats the purpose of pagination, and is frowned upon, but... deadlines
function ConsumeAllPages(url, resultConsumer, service = 'katsu') {
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
}

// NB: I assign to lastPromise a bunch to keep track of whether or not we need to chain promises together
// However, the linter really dislikes this, and assumes I want to put everything inside one useEffect?
/* eslint-disable react-hooks/exhaustive-deps */

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

        searchParams.append('page_size', 100);
        const url = `v2/authorized/donors/?${searchParams}`;

        const donorQueryPromise = () =>
            trackPromise(
                ConsumeAllPages(url, (donor) => donor, 'katsu').then((data) => {
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
                    Object.keys(data).forEach((locName) => {
                        if (reader.filter?.node?.includes(locName)) {
                            // Don't process filtered-out nodes
                            return;
                        }

                        discoveryCounts.patients_per_cohort[locName] = {};
                        donorToDOB[locName] = {};
                        data[locName].forEach((donor) => {
                            if (reader.filter?.program_id?.includes(donor.program_id)) {
                                // Don't process filtered-out programs
                                return;
                            }

                            if (donor.date_of_birth) {
                                donorToDOB[locName][donor.submitter_donor_id] = donor.date_of_birth;
                            }
                            donor.primary_site.forEach((site) => addOrReplace(discoveryCounts.cancer_type_count, site));
                            addOrReplace(discoveryCounts.patients_per_cohort[locName], donor.program_id);
                        });
                    });

                    // Finally, to finish out our counts, we need to query the primary diagnoses
                    return ConsumeAllPages(
                        'v2/authorized/treatments/?page_size=100',
                        (treatment) => [treatment.submitter_donor_id, treatment.treatment_type],
                        'katsu'
                    )
                        .then((treatments) => {
                            Object.keys(treatments).forEach((locName) => {
                                if (reader.filter?.node?.includes(locName)) {
                                    // Don't process filtered-out nodes
                                    return;
                                }

                                treatments[locName]?.forEach(([donorID, treatmentTypes]) => {
                                    if (donorID in donorToDOB[locName]) {
                                        treatmentTypes.forEach((treatmentType) => {
                                            addOrReplace(discoveryCounts.treatment_type_count, treatmentType);
                                        });
                                    }
                                });
                            });
                        })
                        .then(() =>
                            ConsumeAllPages(
                                'v2/authorized/primary_diagnoses/?page_size=100',
                                (diagnosis) => [diagnosis.submitter_donor_id, diagnosis.date_of_diagnosis, diagnosis.program_id],
                                'katsu'
                            )
                        )
                        .then((diagnoses) => {
                            Object.keys(diagnoses).forEach((locName) => {
                                if (reader.filter?.node?.includes(locName)) {
                                    // Don't process filtered-out nodes
                                    return;
                                }

                                diagnoses[locName]?.forEach(([donorID, dateOfDiagnosis, programID]) => {
                                    if (reader.filter?.program_id?.includes(programID)) {
                                        // Don't process filtered-out programs
                                        return;
                                    }

                                    if (donorID in donorToDOB[locName] && dateOfDiagnosis) {
                                        // Convert this to an age range
                                        const diagDate = dateOfDiagnosis.split('-');
                                        const birthDate = donorToDOB[locName][donorID].split('-');
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

                                        delete donorToDOB[locName][donorID];
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
                    () =>
                        ConsumeAllPages(
                            'v2/authorized/sample_registrations/?page_size=100',
                            (sample) => [sample.submitter_sample_id, sample.submitter_donor_id, sample.tumour_normal_designation],
                            'katsu'
                        )
                )
                .then((data) => {
                    // First, we need to parse out all of the samples that exist inside of our finalList (if any)
                    const specimenToDonor = {};
                    const specimenType = {};
                    Object.keys(data).forEach((locName) => {
                        if (reader.filter?.node?.includes(locName)) {
                            // Don't process filtered-out nodes
                            return;
                        }

                        specimenToDonor[locName] = {};
                        specimenType[locName] = {};
                        data[locName]?.forEach(([sampleID, donorID, tumourNormalDesignation]) => {
                            specimenToDonor[locName][sampleID] = donorID;
                            specimenType[locName][sampleID] = tumourNormalDesignation;
                        });
                    });

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

                    if (htsgetPromise) {
                        htsgetPromise.then((htsgetData) => {
                            // Parse out the response from Beacon
                            const htsgetFilteredData = htsgetData
                                .map((loc) => {
                                    const handovers = loc.results?.beaconHandovers;
                                    return (
                                        loc.results.response?.map((response) =>
                                            response.caseLevelData
                                                .map((caseData) => {
                                                    // We need to map before filtering because we need to parse out the program & donor ID
                                                    const id = caseData.biosampleId.split('~');
                                                    if (id.length > 1) {
                                                        caseData.program_id = id[0];
                                                        caseData.submitter_specimen_id = id[1];
                                                        caseData.donorID =
                                                            specimenToDonor[loc.location.name]?.[caseData.submitter_specimen_id];
                                                        caseData.tumour_normal_designation =
                                                            specimenType[loc.location.name]?.[caseData.submitter_specimen_id];
                                                    } else {
                                                        caseData.submitter_specimen_id = caseData.biosampleId;
                                                    }

                                                    caseData.beaconHandover = handovers[0];
                                                    caseData.location = loc.location;
                                                    caseData.position = response.variation.location.interval.start.value;
                                                    return caseData;
                                                })
                                                .filter((caseData) => {
                                                    if (
                                                        reader.donorLists &&
                                                        Object.keys(reader.donorLists).length > 0 &&
                                                        caseData.donorID
                                                    ) {
                                                        return finalList.includes(caseData.donorID);
                                                    }
                                                    return true;
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
