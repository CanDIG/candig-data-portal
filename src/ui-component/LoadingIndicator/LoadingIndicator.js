import React from 'react';
import { MutatingDots } from 'react-loader-spinner';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

/**
 * Loading Indicator component
 * This component is used when loading charts.
 */
const LoadingIndicator = () => (
    <div
        style={{
            width: '100%',
            height: '100',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
    >
        <MutatingDots color="#2BAD60" secondaryColor="#037DB5" height="100" width="110" />
    </div>
);

export { trackPromise, usePromiseTracker, LoadingIndicator };

export default LoadingIndicator;
