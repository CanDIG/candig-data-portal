import { useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/system';

import { useTour } from './TourContext';

// The search page has a fixed global header + a sticky page AppBar (~200px tall).
// Offset Joyride's scrolling so highlighted sections land below them rather than
// behind the header.
const HEADER_SCROLL_OFFSET = 200;

// Expand/collapse the first node's per-program breakdown to demonstrate it during
// the tour. The button exposes its state via data-expanded (set in
// patientCountSingle.jsx), so we only click when a change is actually needed —
// keeping this idempotent across Next/Back navigation.
function setNodeExpanded(shouldExpand) {
    const button = document.querySelector('[data-tour="results-expand-node"]');
    if (!button) return;
    const isExpanded = button.dataset.expanded === 'true';
    if (shouldExpand !== isExpanded) {
        button.click();
    }
}

// Single controlled <Joyride> instance for the whole app. Reads its run state
// from TourContext so it can render over whichever page the tour targets.

function TourRunner() {
    const theme = useTheme();
    const location = useLocation();
    const { run, steps, stepIndex, setStepIndex, stopTour } = useTour();

    // If the user navigates to another page mid-tour, end it — its targets are
    // gone, so continuing would just skip through the remaining steps.
    useEffect(() => {
        if (run) {
            setNodeExpanded(false);
            stopTour();
        }
        // Only react to path changes; including `run` would stop the tour the
        // instant it starts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleCallback = (data) => {
        const { action, index, status, step, type } = data;

        // Clicking the close (X) button ends the tour — the user has opted out,
        // so don't advance to the next step (which would render its beacon).
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
            // Leave nothing expanded behind us. Tours run in place, so there's
            // nothing to navigate to on finish/skip/close.
            setNodeExpanded(false);
            stopTour();
            return;
        }

        // Demonstrate the per-program breakdown: expand as the step opens...
        if (type === EVENTS.STEP_BEFORE && step?.expandDemo) {
            setNodeExpanded(true);
        }

        if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            // ...and collapse it again once we move on.
            if (step?.expandDemo) {
                setNodeExpanded(false);
            }
            // Advance (or go back) once the current step is done.
            setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
        }
    };

    return (
        <Joyride
            run={run}
            steps={steps}
            stepIndex={stepIndex}
            continuous
            showProgress
            showSkipButton
            scrollToFirstStep
            scrollOffset={HEADER_SCROLL_OFFSET}
            callback={handleCallback}
            locale={{ last: 'Finish' }}
            styles={{
                options: {
                    primaryColor: theme.palette.primary.main,
                    zIndex: 10000
                }
            }}
        />
    );
}

export default TourRunner;
