import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { IconPlayerPlay } from '@tabler/icons-react';

import config from '../../../config';
import { SET_MENU } from '../../../store/actions';
import { useTour } from '../../../ui-component/tour/TourContext';
import searchTourSteps from '../../../ui-component/tour/searchTourSteps';
import patientTourSteps from '../../../ui-component/tour/patientTourSteps';
import waitForElement from '../../../ui-component/tour/waitForElement';

const { basename } = config;
const SEARCH_PATH = `${basename}/clinicalGenomicSearch`;
const PATIENT_PATH = `${basename}/patientView`;

// Pages that have a guided tour: each maps to the first target the tour needs
// (also used to confirm the page has mounted) and the steps to run.
const TOURS = {
    [SEARCH_PATH]: { target: '[data-tour="search-sidebar"]', steps: searchTourSteps },
    [PATIENT_PATH]: { target: '[data-tour="patient-info"]', steps: patientTourSteps }
};

// "Take a tour" button shown in the header (left of the profile menu). It appears
// only on pages that have a tour, and starts that page's tour in place without
// navigating.
function TourButton() {
    const location = useLocation();
    const dispatch = useDispatch();
    const { startTour } = useTour();

    const tour = TOURS[location.pathname];
    if (!tour) return null;

    const handleStartTour = () => {
        // Ensure the sidebar drawer (which several steps target) is open, then start
        // once the page's first target has mounted.
        dispatch({ type: SET_MENU, opened: true });
        waitForElement(tour.target).then((found) => {
            if (found) startTour(tour.steps);
        });
    };

    return (
        <Button variant="outlined" size="small" startIcon={<IconPlayerPlay size={18} />} onClick={handleStartTour} sx={{ mr: 1.5 }}>
            Take a tour
        </Button>
    );
}

export default TourButton;
