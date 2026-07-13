import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@mui/material';
import { IconPlayerPlay } from '@tabler/icons-react';

import config from '../../../config';
import { SET_MENU } from '../../../store/actions';
import { useTour } from '../../../ui-component/tour/TourContext';
import searchTourSteps from '../../../ui-component/tour/searchTourSteps';
import waitForElement from '../../../ui-component/tour/waitForElement';

const { basename } = config;
const SEARCH_PATH = `${basename}/clinicalGenomicSearch`;

// "Take a tour" button shown in the header (left of the profile menu). It only
// appears on the Clinical & Genomic Search page — the search tour's steps target
// elements on that page — and starts the tour in place without navigating.
function TourButton() {
    const location = useLocation();
    const dispatch = useDispatch();
    const { startTour } = useTour();

    if (location.pathname !== SEARCH_PATH) return null;

    const handleStartTour = () => {
        // Ensure the filter drawer (which several steps target) is open, then start
        // once the sidebar has mounted.
        dispatch({ type: SET_MENU, opened: true });
        waitForElement('[data-tour="search-sidebar"]').then(() => startTour(searchTourSteps));
    };

    return (
        <Button variant="outlined" size="small" startIcon={<IconPlayerPlay size={18} />} onClick={handleStartTour} sx={{ mr: 1.5 }}>
            Take a tour
        </Button>
    );
}

export default TourButton;
