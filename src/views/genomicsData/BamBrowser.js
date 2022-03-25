import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, FormControl, InputLabel, Input, NativeSelect, FormHelperText } from '@mui/material';
import { Grid } from '@material-ui/core';
import MainCard from 'ui-component/cards/MainCard';

import { useSelector } from 'react-redux';
import { MultiSelect } from 'react-multi-select-component';
import { BASE_URL, ListOfLongReferenceNames, referenceToIgvTrack } from 'store/constant';
import LightCard from 'views/dashboard/Default/LightCard';
import { Map, Description } from '@material-ui/icons';
import DatasetIdSelect from 'views/dashboard/Default/datasetIdSelect';

import BamInstance from 'ui-component/IGV/BamInstance';
import { searchReadGroupSets, getReferenceSet } from 'store/api';

import { notify, NotificationAlert } from 'utils/alert';
import { LoadingIndicator, usePromiseTracker, trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';

import 'assets/css/VariantsSearch.css';

function BamBrowser() {
    const [isLoading, setLoading] = useState(true);
    const events = useSelector((state) => state);
    let { datasetId } = events.customization.update.datasetId;
    const notifyEl = useRef(null);
    const [variantSet, setVariantSets] = useState('');
    const [referenceSetName, setReferenceSetName] = useState('');
    const { promiseInProgress } = usePromiseTracker();
    const [options] = useState([]);
    const [selected, setSelected] = useState([]);
    const [readsTracks, setReadsTracks] = useState([]);
    const [apiResponse, setApiResponse] = useState({});
    const [igvTrackRefGenome, setIgvTrackRefGenome] = useState('');
    const [selectedChr, setSelectedChr] = useState('');

    /*
  Fetches reference set Name and sets referenceSetName
  * @param {string}... referenceSetId
  */
    function settingReferenceSetName(referenceSetId) {
        getReferenceSet(referenceSetId)
            .then((data) => {
                setReferenceSetName(data.results.name);
            })
            .catch(() => {
                setReferenceSetName('Not Available');
            });
    }

    /*
  Build the dropdown for chromosome
  * @param {None}
  * Return a list of options with chromosome
  */
    function chrSelectBuilder() {
        const refNameList = [];

        ListOfLongReferenceNames.forEach((refName) => {
            refNameList.push(
                <option key={refName} value={refName}>
                    {refName}
                </option>
            );
        });
        return refNameList;
    }

    useEffect(() => {
        setSelected([]);
        options.length = 0;
        setReadsTracks([]);
        setLoading(false);
        datasetId = events.customization.update.datasetId;

        // Check for variant and reference name set on datasetId changes
        trackPromise(
            searchReadGroupSets(datasetId)
                .then((data) => {
                    setApiResponse(data);
                    setVariantSets(data.results.total);
                    setSelected([]);
                    options.length = 0;
                    data.results.readGroupSets.forEach((readgroupset) => {
                        options.push({ label: readgroupset.name, value: readgroupset.id });
                    });
                    setSelected(options);
                    settingReferenceSetName(data.results.readGroupSets[0].readGroups[0].referenceSetId);
                })
                .catch(() => {
                    setVariantSets('Not Available');
                    setReferenceSetName('Not Available');

                    // Do not show error message when datasetId is empty
                    if (datasetId !== '') {
                        notify(notifyEl, 'No ReadGroupSets are available.', 'warning');
                    }
                })
        );
    }, [datasetId, options, events.customization.update.datasetId]);

    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission
        const tracks = [];

        if (selected) {
            selected.forEach((readGroupSetId) => {
                const readGroupIds = [];

                apiResponse.results.readGroupSets.forEach((readGroupSet) => {
                    if (readGroupSetId.value === readGroupSet.id) {
                        readGroupSet.readGroups.forEach((readGroup) => {
                            readGroupIds.push(readGroup.id);
                        });
                    }
                });

                const rawReferenceId = `["${referenceSetName}","${e.target.chromosome.value}"]`;
                const referenceId = btoa(rawReferenceId).replaceAll('=', '');

                const igvAlignmentObject = {
                    sourceType: 'ga4gh',
                    type: 'alignment',
                    url: BASE_URL,
                    name: readGroupSetId.label,
                    referenceId,
                    readGroupIds,
                    readGroupSetIds: readGroupSetId.value,
                    visibilityWindow: 1000,
                    sort: {
                        chr: `chr${e.target.chromosome.value}`
                    }
                };

                tracks.push(igvAlignmentObject);
            });
        }

        // Determine the reference genome for IGV based on the name of referenceSet
        Object.keys(referenceToIgvTrack).forEach((key) => {
            if (referenceToIgvTrack[key].includes(referenceSetName.toLowerCase())) {
                setIgvTrackRefGenome(key);
            }
        });

        setSelectedChr(e.target.chromosome.value);
        setReadsTracks(tracks);
    };

    return (
        <>
            <MainCard title="Bam Browser" sx={{ minHeight: 830, position: 'relative' }}>
                <DatasetIdSelect />
                <Grid container direction="column" className="content">
                    {/* <NotificationAlert ref={notifyEl} /> */}
                    <Grid container direction="row" justifyContent="center" spacing={2} p={2}>
                        <Grid item sm={12} xs={12} md={4} lg={4}>
                            {promiseInProgress === true ? (
                                <LoadingIndicator />
                            ) : (
                                <LightCard
                                    isLoading={isLoading}
                                    header="Reference Genome"
                                    value={referenceSetName}
                                    icon={<Map fontSize="inherit" />}
                                />
                            )}
                        </Grid>
                        <Grid item sm={12} xs={12} md={4} lg={4}>
                            {promiseInProgress === true ? (
                                <LoadingIndicator />
                            ) : (
                                <LightCard
                                    isLoading={isLoading}
                                    header="ReadGroupSets/BAMs"
                                    value={variantSet}
                                    icon={<Description fontSize="inherit" />}
                                />
                            )}
                        </Grid>
                    </Grid>

                    <form inline onSubmit={formHandler} style={{ justifyContent: 'center' }}>
                        <Grid container direction="row" justifyContent="center" alignItems="baseline" spacing={2} p={2}>
                            <Grid item>
                                {options.length > 0 && (
                                    <FormControl>
                                        <Grid container direction="row">
                                            <Box mr={2} style={{ marginTop: '10px' }}>
                                                <p>BAM</p>
                                            </Box>
                                            <MultiSelect // Width set in CSS
                                                options={options}
                                                value={selected}
                                                onChange={setSelected}
                                                labelledBy="Variant Set"
                                            />
                                        </Grid>
                                    </FormControl>
                                )}
                            </Grid>
                            <Grid item sx={{ minWidth: 150 }}>
                                <FormControl fullWidth variant="standard">
                                    <InputLabel id="chr-label">Chromosome</InputLabel>
                                    <NativeSelect labelId="chr-label" required id="chromosome">
                                        {chrSelectBuilder()}
                                    </NativeSelect>
                                </FormControl>
                            </Grid>

                            <Grid item>
                                <Button type="submit" variant="contained">
                                    Open Browser
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    <BamInstance tracks={readsTracks} genome={igvTrackRefGenome} chromosome={selectedChr} />
                </Grid>
            </MainCard>
        </>
    );
}

export default BamBrowser;
