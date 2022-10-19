import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
/* eslint-disable */

import igv from '@candig/igv/dist/igv.esm';
import { htsget } from 'store/api';

function HtsgetInstance(BamIdList, VcfIdList) {
    /** *
     * A functional component that returns an IGV.js instance dedicated to rendering GWAS data.
     * Note: There does not seem to be a way for us to know which reference genome is being used
     * Therefore, the Htsget instance below defaults to using hg38
     */
    const igvBrowser = useRef(null);

    const modelBamTrack = {
        type: 'alignment',
        sourceType: 'htsget',
        format: 'bam',
        url: `${htsget}/htsget/v1/reads/data/`
    };

    const modelVcfTrack = {
        type: 'variant',
        format: 'vcf',
        sourceType: 'htsget',
        url: `${htsget}/htsget/v1/variants/data/`
    };

    // Dynamically create a list of tracks based on types of files available
    // Example tracks are listed as below

    // {
    //     type: 'alignment',
    //     sourceType: 'htsget',
    //     format: 'bam',
    //     url: `${htsget}/htsget/v1/reads/data/NA02102.bam`
    // },
    // {
    //     type: 'variant',
    //     format: 'vcf',
    //     sourceType: 'htsget',
    //     url: `${htsget}/htsget/v1/variants/data/NA18537`
    // }

    useEffect(() => {
        const igvOptions = {
            genome: 'hg38',
            tracks: []
        };

        const tracks = [];

        // Create a list of tracks based on the list of BAM IDs
        for (let i = 0; i < BamIdList.length; i += 1) {
            const newBamTrack = modelBamTrack;
            newBamTrack.url += BamIdList[i];
            tracks.push(newBamTrack);
        }

        // Create a list of tracks based on the list of VCF IDs
        for (let i = 0; i < VcfIdList.length; i += 1) {
            const newVcfTrack = modelVcfTrack;
            newVcfTrack.url += VcfIdList[i];
            tracks.push(newVcfTrack);
        }

        // Update the tracks
        igvOptions.tracks = tracks;

        igv.removeAllBrowsers(); // Remove existing browser instances

        // Do not create new browser instance on page load as no sample is selected.
        igv.createBrowser(igvBrowser.current, igvOptions);
    }, [BamIdList, VcfIdList]);

    return (
        <>
            <div style={{ background: 'white', marginTop: '15px', marginBottom: '15px' }} ref={igvBrowser} />
        </>
    );
}

HtsgetInstance.propTypes = {};

export default HtsgetInstance;
