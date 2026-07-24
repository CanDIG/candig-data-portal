import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import searchTourSteps from './searchTourSteps';

// Holds the state of the in-browser guided tour so that a single <Joyride>
// (mounted in MainLayout) can be driven from anywhere in the app — e.g. the
// header's "Take a tour" button (search page) or the patient page.

const TourContext = createContext(null);

export function TourProvider({ children }) {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [steps, setSteps] = useState([]);

    const startTour = useCallback((tourSteps = searchTourSteps) => {
        setSteps(tourSteps);
        setStepIndex(0);
        setRun(true);
    }, []);

    const stopTour = useCallback(() => {
        setRun(false);
        setStepIndex(0);
    }, []);

    const value = useMemo(
        () => ({ run, steps, stepIndex, setStepIndex, startTour, stopTour }),
        [run, steps, stepIndex, startTour, stopTour]
    );

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

TourProvider.propTypes = {
    children: PropTypes.node
};

export function useTour() {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
}

export default TourContext;
