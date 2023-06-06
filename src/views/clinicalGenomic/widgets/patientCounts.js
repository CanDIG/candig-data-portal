import * as React from 'react';
import { useSearchResultsReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

function PatientCounts(props) {
    const sitesContext = useSearchResultsReaderContext();
    console.log(sitesContext);

    return (
        <>
            {/* Header */}
            {/* Individual counts*/}
            {sitesContext?.['sites']?.map((site) => (
                <React.Fragment key={site}>
                    <PatientCountSingle site={site} />
                    <br />
                </React.Fragment>
            )) || <></>}
        </>
    );
}

export default PatientCounts;
