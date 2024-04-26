import PropTypes from 'prop-types';
import { MutatingDots } from 'react-loader-spinner';
import { trackPromise, usePromiseTracker } from 'react-promise-tracker';

/**
 * SearchIndicator component
 * This loading indicator is used in search.
 */
export function SearchIndicator({ area }) {
    // const { promiseInProgress } = usePromiseTracker({ area });
    return (
        // promiseInProgress && (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <MutatingDots color="#2BAD60" secondaryColor="#037DB5" height="100" width="110" />
        </div>
        // )
    );
}

SearchIndicator.propTypes = {
    area: PropTypes.string
};

SearchIndicator.defaultProps = {
    area: 'area'
};

export default SearchIndicator;

export { trackPromise, usePromiseTracker };
