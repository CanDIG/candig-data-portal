import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// TODO: Importing from igv.esm.min.js is not working
import igv from '@candig/igv/dist/igv.esm';

function VcfInstance({ tracks, genome }) {
    /** *
     * A functional component that returns an IGV.js instance dedicated to rendering VCF files.
     */
    const igvBrowser = useRef(null);

    useEffect(() => {
        const igvOptions = {
            genome,
            tracks: []
        };
        igv.removeAllBrowsers(); // Remove existing browser instances

        // Do not create new browser instance on page load as no sample is selected.
        igvOptions.tracks = tracks;

        if (igvOptions.tracks.length > 0) {
            igv.createBrowser(igvBrowser.current, igvOptions);
        }
    }, [tracks, genome]);

    return <div className="ml-auto mr-auto" style={{ background: 'white', marginTop: '15px' }} ref={igvBrowser} />;
}

VcfInstance.propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
    genome: PropTypes.string.isRequired
};

export default VcfInstance;
