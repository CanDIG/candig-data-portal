import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useTheme } from '@mui/system';

import { useTour } from './TourContext';

// Expand/collapse the first node's per-program breakdown to demonstrate it during
// the tour. The expand button toggles between an UnfoldMore icon (collapsed) and
// an UnfoldLess icon (expanded), so we only click when a change is actually needed
// — keeping this idempotent across Next/Back navigation.
function setNodeExpanded(shouldExpand) {
    const button = document.querySelector('[data-tour="results-expand-node"]');
    if (!button) return;
    const isCollapsed = !!button.querySelector('[data-testid="UnfoldMoreIcon"]');
    if (shouldExpand && isCollapsed) {
        button.click();
    } else if (!shouldExpand && !isCollapsed) {
        button.click();
    }
}

// Single controlled <Joyride> instance for the whole app. Reads its run state
// from TourContext so it can render over whichever page the tour targets.

function TourRunner() {
    const theme = useTheme();
    const { run, steps, stepIndex, setStepIndex, stopTour } = useTour();

    const handleCallback = (data) => {
        const { action, index, status, step, type } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            // Leave nothing expanded behind us. Tours run in place, so there's
            // nothing to navigate to on finish/skip.
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
            // The search page has a fixed global header + a sticky page AppBar
            // (~200px). Offset scrolling so highlighted sections land below them
            // instead of behind the header.
            scrollOffset={200}
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
