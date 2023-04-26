import * as React from 'react';
import { useFederationSitesReaderContext } from '../FederationSitesContext';
import PatientCountSingle from "./patientCountSingle";

function PatientCounts(props) {
    //const sitesContext = useFederationSitesReaderContext();
    const sitesContext = {sites: ["BCGSC", "UHN"]}

    return <>
        {/* Header */}
        {/* Individual counts*/}
        {sitesContext["sites"].map((site) => 
            <>
                <PatientCountSingle
                    site={site}
                    key={site}
                    />
                <br />
            </>
        )}
    </>;
}

export default PatientCounts;

