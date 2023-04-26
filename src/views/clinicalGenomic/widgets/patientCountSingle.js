import { useEffect, useState } from 'react';

import {
    Avatar,
    Box,
    Button,
    CardHeader,
    Divider,
    Stack,
    Typography
} from "@mui/material";
import { useTheme, makeStyles } from '@mui/styles';

import { useSearchResultsReaderContext } from '../SearchResultsContext';

const useStyles = makeStyles((theme) => ({
    patientEntry: {
        // React center span?
    },
    siteName: {
        // Left-aligned
        width: 120
    },
    locked: {
        backgroundColor: "#e4e4e4"
    },
    button: {
        // Right-aligned
        float: "right",
        marginLeft: "auto"
    }
}));

function PatientCountSingle(props) {
    const { site } = props;
    const theme = useTheme();
    const classes = useStyles();
    //const searchResults = useSearchResultsReaderContext();
    const searchResults={
        "BCGSC": {
            totalPatients: 850,
            patientsInSearch: 250,
            cohorts: 1,
            locked: false
        },
        "UHN": {
            totalPatients: 250,
            patientsInSearch: 120,
            cohorts: 8,
            locked: true
        }
    }
    let totalPatients = searchResults[site]["totalPatients"];
    let patientsInSearch = searchResults[site]["patientsInSearch"];
    let cohorts = searchResults[site]["cohorts"];
    let locked = searchResults[site]["locked"];

    return <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2, boxShadow: 2 }} className={locked ? classes.locked : ""}>
        <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
            <Box mr={2} ml={1} p={1} pr={5} className={classes.siteName}>
                <CardHeader
                    avatar={
                        <Avatar>{site.slice(0,1).toUpperCase()}</Avatar>
                    }
                    title={site}
                    />
            </Box>
            <Box mr={2} ml={1} p={1} pr={5}>
                <Typography className={classes.patientEntry}>{totalPatients}</Typography>
            </Box>
            <Box mr={2} ml={1} p={1} pr={5}>
                <Typography className={classes.patientEntry}>{patientsInSearch}</Typography>
            </Box>
            <Box mr={2} ml={1} p={1} pr={5}>
                <Typography className={classes.patientEntry}>{cohorts}</Typography>
            </Box>
            <Box mr={2} ml={1} p={1} pr={5} className={classes.button}>
                {locked ?
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ borderRadius: 1.8 }}
                        >
                        Request Access
                    </Button>
                : <></>}
            </Box>
        </Stack>
    </Box>;
}

export default PatientCountSingle;
