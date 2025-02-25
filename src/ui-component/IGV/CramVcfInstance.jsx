import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// TODO: Importing from igv.esm.min.js is not working
import igv from '@candig/igv/dist/igv.esm';

function CramVcfInstance({ options }) {
    /** *
     * A functional component that returns an IGV.js instance dedicated to rendering VCF files.
     */
    const igvBrowser = useRef(null);

    useEffect(() => {
        igv.removeAllBrowsers(); // Remove existing browser instances

        if (options.tracks.length > 0) {
            igv.createBrowser(igvBrowser.current, options);
        }
    }, [options]);

    return <div className="ml-auto mr-auto" style={{ background: 'white', marginTop: '15px' }} ref={igvBrowser} />;
}

CramVcfInstance.propTypes = {
    options: PropTypes.object.isRequired
};

export default CramVcfInstance;
