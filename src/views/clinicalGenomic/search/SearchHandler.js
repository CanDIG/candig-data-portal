import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { trackPromise } from 'react-promise-tracker';

import { useSearchResultsWriterContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import { queryBeacon, fetchBeaconFilteringTerms, fetchDatasetPermissions } from 'store/api';
import { isCensored } from 'utils/utils';

// The old function to collate summary statistics from multiple sites together
// Needs to be reworked to the new beacon format
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

function ParseISO8601Year(text) {
    if (typeof text !== 'string') return undefined;
    const regex = /(\d+)Y/.exec(text);
    if (!regex) return undefined;
    return regex[1];
}

// Format incoming clinical data from Beacon into a form that the frontend expects
// Is this actually the best way to go forwards? Or should I just be rewriting the frontend components
function FormatClinicalData(data) {
    // data: Object (site) => { exists, resultsCount, resultsHandover, setType, results:
    // _     [{dataset_id, diseases, ethnicity, id, interventionsOrProcedures, location, measures, sex, treatments}]
    // }
    // return format: Object (site) => { count, genomic: [], results:
    // _     [{cause_of_death, date_alive_after_lost_to_followup, date_of_birth, date_of_death, date_resolution,
    // _       deceased, gender, is_deceased, location, lost_to_followup_after_clinical_event_identifier,
    // _       lost_to_followup_reason, program_id, sex_at_birth, submitter_donor_id}]
    // }

    const retVal = {
        count: data.resultsCount,
        results: data.results.map((donor) => ({
            program_id: donor.dataset_id,
            submitter_donor_id: donor.id,
            sex_at_birth: donor.sex?.label,
            num_exposures: donor.exposures?.length || 0,
            num_interventions: donor.interventionsOrProcedures?.length || 0,
            num_measures: donor.measures?.length || 0,
            // Need to figure out how to get the _first_ age of onset
            age_at_diagnosis: ParseISO8601Year(donor.diseases?.[0]?.ageOfOnset?.iso8601duration) || undefined,
            num_treatments: donor.treatments?.length || 0
        }))
    };

    return retVal;
}

function FormatFederationData(data) {
    return data
        .map((site) => {
            if (!site?.results?.info?.patients_per_program) {
                return undefined;
            }

            const newResults = Object.keys(site?.results?.info?.patients_per_program).map((program) => ({
                patients_count: site?.results?.info?.patients_per_program[program],
                program_id: program
            }));

            return { ...site, results: newResults };
        })
        .filter((item) => item);
}

function FormatSidebarData(data) {
    const RemoveNulls = (items) => items.filter((term) => term !== 'No value' && term !== 'No matching concept');

    return data.map((site) => {
        const newResults = {
            treatment_types: RemoveNulls(Object.keys(site?.results?.info?.treatment_type_count || {})),
            tumour_primary_sites: RemoveNulls(Object.keys(site?.results?.info?.primary_site_count || {})),
            drug_names: RemoveNulls(Object.keys(site?.results?.info?.drug_type_count || {}))
        };

        return { ...site, results: newResults };
    });
}

function FormatFilteringTerms(data) {
    // We need to merge the results from each response
    const allTerms = new Set();
    data.forEach((site) => {
        site?.results?.response?.filteringTerms?.forEach((item) => allTerms.add(item.id));
    });
    return allTerms;
}

function FormatFilters(data) {
    const retVal = {};
    data.forEach((site) => {
        if (typeof site?.results?.response?.filteringTerms !== 'undefined') {
            site.results.response.filteringTerms.forEach((term) => {
                retVal[term.label] = term.id;
            });
        }
    });
    return retVal;
}

function FormatAuthorization(authData, fedData) {
    const allowedPrograms = {};
    // authData contains the results from federating v1/authz/user/me
    authData.forEach((site) => {
        const siteID = site.location.name;

        if (typeof site?.results?.site_roles === 'undefined') {
            // We have run into some sort of error here
            return;
        }

        // Each site has an object with: userinfo, site_roles, dataset_authorizations{ team_member: [], dataset_curator: [], dac_authorizaztions: [] }
        // In the case of site-admins, we are allowed to see every authorization in this site
        if (site.results.site_roles.includes('admin')) {
            const matchingFedSite = fedData.find((fedSite) => fedSite.location.name === siteID);
            if (matchingFedSite && Array.isArray(matchingFedSite.results)) {
                allowedPrograms[siteID] = matchingFedSite.results.map((results) => results.program_id);
            }
            return;
        }

        // Otherwise, we are authorized to view each program with any of the given dataset_authorizations
        allowedPrograms[siteID] = site.results.dataset_authorizations.team_member
            .concat(site.results.dataset_authorizations.dataset_curator)
            .concat(site.results.dataset_authorizations.dac_authorizations);
    });
    return allowedPrograms;
}

// This handles transforming queries in the SearchResultsContext to actual search queries
// NB: I assign to lastPromise a bunch to keep track of whether or not we need to chain promises together
// However, the linter really dislikes this, and assumes I want to put everything inside one useEffect?
/* eslint-disable react-hooks/exhaustive-deps */
function SearchHandler({ setLoading }) {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();
    const summaryFetchAbort = useRef(new AbortController());
    const clinicalFetchAbort = useRef(new AbortController());
    const [filters, setFilters] = useState({});

    // Query 1: always have the federation sites and authorized programs query results available
    let lastPromise = null;
    useEffect(() => {
        setLoading(true);
        lastPromise = trackPromise(
            fetchBeaconFilteringTerms()
                .then((data) => {
                    writer((old) => ({ ...old, filters: FormatFilteringTerms(data) }));
                    setFilters((_) => FormatFilters(data));
                })
                .then(() => queryBeacon({ page_size: 1 }))
                .then((data) => {
                    writer((old) => ({
                        ...old,
                        federation: FormatFederationData(data),
                        sidebar: FormatSidebarData(data)
                    }));
                    return FormatFederationData(data);
                })
                .then((fedData) => Promise.all([fetchDatasetPermissions(), fedData]))
                .then((data) => {
                    const authData = data[0];
                    const fedData = data[1];
                    writer((old) => ({
                        ...old,
                        auth: FormatAuthorization(authData, fedData)
                    }));
                })
                .finally(() => setLoading(false)),
            'federation'
            /* fetchFederatedSubServices(`v3/discovery/sidebar_list`)
                .then((data) => writer((old) => ({ ...old, sidebar: data })))
                .then(() => fetchFederatedSubServices('v3/discovery/overview/patients_per_program'))
                .then((data) => writer((old) => ({ ...old, federation: data })))
                // NB: fetch instead of fetchWithRelogin because Katsu is misbehaving
                .then(() => fetchFederation('v3/authorized/programs', 'katsu', {}, fetch))
                .then((data) => writer((old) => ({ ...old, programs: data })))
                .then(() => fetch('/genomics/htsget/v1/genes'))
                .then((response) => (response.ok ? response.json() : console.log(response)))
                .then((data) => writer((old) => ({ ...old, genes: data?.results })))
                .finally(() => setLoading(false)), */
        );
    }, []);

    /* // Query 2: when the search query changes including just the page number, re-query
    useEffect(() => {
        // First, abort any currently-running search promises
        summaryFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        // **Add genomic_data_types if it exists**
        if (reader.query?.genomic_data_types) {
            queryNoPageSize.genomic_data_types = reader.query.genomic_data_types;
        }

        setLoading(true);
        const discoveryPromise = () => new Promise(() => {});
        query(queryNoPageSize, newAbort.signal, 'discovery/query')
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
                        console.log(error.message);
                    }
                });

        if (lastPromise === null) {
            lastPromise = discoveryPromise();
        } else {
            lastPromise.then(discoveryPromise);
        }

        summaryFetchAbort.current = newAbort;
    }, [reader.reqNum]); */

    // Query 3: when the search query changes, re-query the server
    useEffect(() => {
        // First, we abort any currently-running search promises
        clinicalFetchAbort.current.abort('New request started');
        const newAbort = new AbortController();

        // TODO: incoming filters need to be converted to their internal IDs (which we have from the filtering_terms call earlier)
        const donorQueryPromise = () =>
            queryBeacon(reader.query, filters, newAbort.signal)
                .then((data) => {
                    if (reader.filter?.node) {
                        data = data.filter((site) => !reader.filter.node.includes(site.location.name));
                    }

                    // Reorder the data, and fill out the patients per program
                    const clinicalData = {};
                    const DISCOVERY_FIELDS = ['primary_site_count', 'treatment_type_count', 'age_at_diagnosis', 'drug_type_count'];
                    const discoveryCounts = { patients_per_program: {} }; // Note: patients_per_program handled differently
                    DISCOVERY_FIELDS.forEach((field) => {
                        discoveryCounts[field] = {};
                    });

                    data.forEach((site) => {
                        if ('results' in site) {
                            // Grab the clinical data
                            const resultSets = site?.results?.response?.resultSets;
                            if (resultSets.length > 1) {
                                console.warn("More than one result set found, need to figure out what's going on");
                                clinicalData[site.location.name] = FormatClinicalData(resultSets[0]);
                            } else if (resultSets.length > 0) {
                                clinicalData[site.location.name] = FormatClinicalData(resultSets[0]);
                            }

                            // Grab the discovery data as well
                            DISCOVERY_FIELDS.forEach((field) => {
                                if (typeof site?.results?.info?.[field] === 'undefined') {
                                    return;
                                }

                                Object.keys(site.results?.info?.[field]).forEach((datum) => {
                                    if (datum in discoveryCounts[field]) {
                                        discoveryCounts[field][datum] += site.results.info[field][datum];
                                    } else {
                                        discoveryCounts[field][datum] = site.results.info[field][datum];
                                    }
                                });
                            });

                            // patients_per_program is added verbatim, instead of being collated together
                            // TODO: The results need to be reformatted to the old style (see FormatFederationData)
                            if (typeof site?.results?.info?.patients_per_program !== 'undefined') {
                                discoveryCounts.patients_per_program[site.location.name] = site.results.info.patients_per_program;
                            }
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

                    writer((old) => ({
                        ...old,
                        clinical: clinicalData,
                        genomic: genomicData,
                        counts: discoveryCounts,
                        // federation: discoveryCounts.patients_per_program,
                        loading: false
                    }));
                    // console.log(data);
                })
                .catch((error) => {
                    // Ignore abort errors
                    if (error !== 'New request started') console.log(error.message);
                })
                .finally(() => setLoading(false));

        /* Old code:
            query(reader.query, newAbort.signal)
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
            }) */
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

        /* const url = `v3/authorized/donor_with_clinical_data/program/${reader.program}/donor/${reader.donorID}`;
        trackPromise(
            fetchFederation(url, 'katsu')
                .then((data) => {
                    writer((old) => ({ ...old, donor: data }));
                })
                .finally(() => setLoading(false)),
            'donor'
        ); */
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
