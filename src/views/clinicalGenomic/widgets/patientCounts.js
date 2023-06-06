import * as React from 'react';
import { useSearchResultsReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

function PatientCounts(props) {
    const sitesContext = useSearchResultsReaderContext()?.federation;
    console.log(sitesContext);

    return (
        <>
            {/* Header */}
            {/* Individual counts*/}
            {Array.isArray(sitesContext) ?
                sitesContext.map((searchResults) => (
                    <React.Fragment key={searchResults?.location?.name}>
                        <PatientCountSingle site={searchResults?.location?.name} searchResults={searchResults} />
                        <br />
                    </React.Fragment>
                ))
            : <></>}
        </>
    );
}

export default PatientCounts;
