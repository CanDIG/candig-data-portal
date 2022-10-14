import React, { useState, useEffect } from 'react';

import MainCard from 'ui-component/cards/MainCard';
import { Grid, Box, Button, FormControl, InputLabel, Input, NativeSelect } from '@mui/material';

import { useSelector } from 'react-redux';
import { MultiSelect } from 'react-multi-select-component';

import VariantsTable from 'ui-component/Tables/VariantsTable';
import { searchVariant, searchVariantSets, searchVariantByVariantSetIds, getReferenceSet } from 'store/api';
import { ListOfReferenceNames } from 'store/constant';
import LightCard from 'views/dashboard/Default/LightCard';
import DatasetIdSelect from 'views/dashboard/Default/datasetIdSelect';
import { LoadingIndicator, usePromiseTracker, trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';
import { SearchIndicator } from 'ui-component/LoadingIndicator/SearchIndicator';
import { Map, Description } from '@mui/icons-material';
import AlertComponent from 'ui-component/AlertComponent';

import 'assets/css/VariantsSearch.css';

function VariantsSearch() {
    const [isLoading, setLoading] = useState(true);
    const events = useSelector((state) => state);
    const [datasetId, setDatasetId] = useState(events.customization.update.datasetId);
    const [rowData, setRowData] = useState([]);
    const [displayVariantsTable, setDisplayVariantsTable] = useState(false);
    const [variantSet, setVariantSets] = useState('');
    const [referenceSetName, setReferenceSetName] = useState('');
    const { promiseInProgress } = usePromiseTracker();
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [variantSetIds, setVariantSetIds] = useState([]);
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('warning');

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

        ListOfReferenceNames.forEach((refName) => {
            refNameList.push(
                <option key={refName} value={refName}>
                    {refName}
                </option>
            );
        });
        return refNameList;
    }

    useEffect(() => {
        setLoading(false);
        setDisplayVariantsTable(false);
    }, []);

    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission
        setDisplayVariantsTable(false);
    };

    return (
        <>
            <MainCard
                title="Variants Search"
                sx={{ minHeight: 830, position: 'relative', borderRadius: events.customization.borderRadius * 0.25 }}
            >
                <AlertComponent
                    open={open}
                    setOpen={setOpen}
                    text={alertMessage}
                    severity={alertSeverity}
                    variant="filled"
                    fontColor={alertSeverity === 'error' ? 'white' : 'black'}
                />
                <Grid container direction="column" className="content">
                    <form onSubmit={formHandler} style={{ justifyContent: 'center' }}>
                        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} p={2}>
                            <Grid item sx={{ minWidth: 150 }}>
                                <FormControl fullWidth variant="standard">
                                    <InputLabel id="chr-label">Chromosome</InputLabel>
                                    <NativeSelect labelId="chr-label" required id="chromosome">
                                        {chrSelectBuilder()}
                                    </NativeSelect>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <InputLabel for="start">Start</InputLabel>
                                    <Input required type="number" id="start" />
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <InputLabel for="end">End</InputLabel>
                                    <Input required type="number" id="end" />
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl variant="standard">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                    >
                                        Search
                                    </Button>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </form>

                    {displayVariantsTable ? (
                        <VariantsTable rowData={rowData} datasetId={events.customization.update.datasetId} />
                    ) : (
                        <SearchIndicator area="table" />
                    )}
                </Grid>
            </MainCard>
        </>
    );
}

export default VariantsSearch;
