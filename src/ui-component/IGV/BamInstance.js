import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// TODO: Importing from igv.esm.min.js is not working
import igv from '@candig/igv/dist/igv.esm';

function BamInstance({ tracks, genome, chromosome }) {
    /** *
     * A functional component that returns an IGV.js instance dedicated to rendering BAM/CRAM files.
     */
    const igvBrowser = useRef(null);

    useEffect(() => {
        const igvOptions = {
            genome,
            showChromosomeWidget: false,
            tracks: []
        };
        igv.removeAllBrowsers(); // Remove existing browser instances

        // Do not create new browser instance on page load as no sample is selected.
        igvOptions.tracks = tracks;

        if (igvOptions.tracks.length > 0) {
            igv.createBrowser(igvBrowser.current, igvOptions).then((browser) => {
                // browser.on('trackclick', (track, popoverData) => {
                //    console.log(popoverData);
                // });
                if (chromosome.includes('chr')) {
                    browser.search(chromosome);
                } else {
                    browser.search(`chr${chromosome}`);
                }
            });
        }
    }, [tracks, genome, chromosome]);

    return <div className="ml-auto mr-auto" style={{ background: 'white', marginTop: '15px' }} ref={igvBrowser} />;
}

BamInstance.propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.object).isRequired,
    genome: PropTypes.string.isRequired,
    chromosome: PropTypes.string.isRequired
};

export default BamInstance;
